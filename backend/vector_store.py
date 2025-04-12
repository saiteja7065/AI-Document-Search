from typing import List, Dict, Any
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import numpy as np
from config import settings

class VectorStore:
    def add_document(self, document_id: str, text_chunks: List[str], metadata: Dict[str, Any] = None):
        """Add document chunks to the vector store"""
        if self.use_mock:
            return
        
        # Generate embeddings for chunks
        embeddings = self.model.encode(text_chunks)
        
        # Add to Chroma
        self.collection.add(
            embeddings=embeddings.tolist(),
            documents=text_chunks,
            ids=[f"{document_id}_{i}" for i in range(len(text_chunks))],
            metadatas=[{**metadata, "chunk_index": i} for i in range(len(text_chunks))] if metadata else None
        )
        
    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents using the query"""
        if self.use_mock:
            return []
            
        # Generate query embedding
        query_embedding = self.model.encode(query)
        
        # Search in Chroma
        results = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=limit
        )
        
        # Format results
        formatted_results = []
        for i in range(len(results['ids'][0])):
            doc_id = results['ids'][0][i].split('_')[0]  # Get original document ID
            formatted_results.append({
                'document_id': doc_id,
                'chunk_text': results['documents'][0][i],
                'similarity_score': float(results['distances'][0][i]) if 'distances' in results else 0.0,
                'metadata': results['metadatas'][0][i] if results['metadatas'] else {}
            })
        
        return formatted_results

    def delete_document(self, document_id: str):
        """Delete all chunks for a document"""
        if self.use_mock:
            return
            
        # Get all chunk IDs for the document
        results = self.collection.get(where={"document_id": document_id})
        if results and results['ids']:
            self.collection.delete(ids=results['ids'])
            
    def get_similar_documents(self, document_id: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Find documents similar to a given document"""
        if self.use_mock:
            return []
            
        # Get document embeddings
        results = self.collection.get(where={"document_id": document_id})
        if not results or not results['embeddings']:
            return []
            
        # Use first chunk as representative embedding
        doc_embedding = results['embeddings'][0]
        
        # Search for similar documents
        similar = self.collection.query(
            query_embeddings=[doc_embedding],
            n_results=limit + 1  # Add 1 to account for the document itself
        )
        
        # Filter out the original document and format results
        formatted_results = []
        seen_docs = set()
        for i in range(len(similar['ids'][0])):
            doc_id = similar['ids'][0][i].split('_')[0]
            if doc_id != document_id and doc_id not in seen_docs:
                seen_docs.add(doc_id)
                formatted_results.append({
                    'document_id': doc_id,
                    'similarity_score': float(similar['distances'][0][i]) if 'distances' in similar else 0.0,
                    'metadata': similar['metadatas'][0][i] if similar['metadatas'] else {}
                })
                
        return formatted_results[:limit]