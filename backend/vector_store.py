import os
import uuid
import json
import tempfile
import numpy as np
from typing import List, Dict, Optional
import chromadb
from config import settings

class VectorStore:
    """
    Manages document vectors for semantic search using Chroma DB.
    """
    
    def __init__(self, use_mock=False):
        """
        Initialize the vector store.
        
        Args:
            use_mock: If True, use a mock implementation instead of ChromaDB
        """
        self.use_mock = use_mock
        
        if self.use_mock:
            self._initialize_mock_storage()
            return
        
        # Get persist directory from settings
        persist_directory = settings.CHROMA_PERSIST_DIRECTORY
        
        # Make sure the directory exists
        os.makedirs(persist_directory, exist_ok=True)
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Get or create collection for documents
        self.collection = self.client.get_or_create_collection("documents")
    
    def _initialize_mock_storage(self):
        """Initialize mock storage for vector search."""
        self.mock_vectors = {}
        self.mock_documents = {}
        print("Using mock implementation of VectorStore")
    
    def _mock_embedding(self, text: str) -> List[float]:
        """Generate a mock embedding vector for text."""
        # Create a deterministic but unique vector based on the text
        # This is just for demo purposes, not for real similarity search
        hash_val = hash(text) % 10000
        np.random.seed(hash_val)
        return np.random.rand(384).tolist()  # 384-dimensional vector
    
    def _calculate_mock_similarity(self, query_vector: List[float], doc_vector: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        # Convert to numpy arrays
        vec1 = np.array(query_vector)
        vec2 = np.array(doc_vector)
        
        # Calculate cosine similarity
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        # Avoid division by zero
        if norm1 == 0 or norm2 == 0:
            return 0
            
        return dot_product / (norm1 * norm2)
    
    def add_document(self, document_id: str, chunks: List[str], metadata: Dict) -> None:
        """
        Add document chunks to the vector store for search.
        
        Args:
            document_id: The document ID
            chunks: List of text chunks to add
            metadata: Additional metadata for the document
        """
        if self.use_mock:
            # Mock implementation
            for i, chunk in enumerate(chunks):
                chunk_id = f"{document_id}_{i}"
                embedding = self._mock_embedding(chunk)
                
                # Store the chunk and its embedding
                self.mock_vectors[chunk_id] = embedding
                self.mock_documents[chunk_id] = {
                    "document_id": document_id,
                    "content": chunk,
                    "metadata": metadata,
                    "chunk_index": i
                }
            return
        
        # Real implementation with ChromaDB
        # Add chunks to the collection
        for i, chunk in enumerate(chunks):
            chunk_id = f"{document_id}_{i}"
            
            # Add metadata for each chunk
            chunk_metadata = {
                "document_id": document_id,
                "chunk_index": i,
                **metadata
            }
            
            # Add to ChromaDB
            self.collection.add(
                ids=[chunk_id],
                documents=[chunk],
                metadatas=[chunk_metadata]
            )
    
    def search(self, query: str, limit: int = 5, filter_criteria: Optional[Dict] = None) -> List[Dict]:
        """
        Search for documents using a natural language query.
        
        Args:
            query: The search query
            limit: Maximum number of results to return
            filter_criteria: Optional filter to apply to search results
            
        Returns:
            List of search results with document ID, content, and similarity score
        """
        if self.use_mock:
            # Mock implementation
            # Create a query embedding
            query_embedding = self._mock_embedding(query)
            
            # Calculate similarity scores for all chunks
            results = []
            for chunk_id, doc_embedding in self.mock_vectors.items():
                similarity = self._calculate_mock_similarity(query_embedding, doc_embedding)
                doc_info = self.mock_documents[chunk_id]
                
                # Apply filter if specified
                if filter_criteria:
                    # Simple filtering logic - all criteria must match
                    match = True
                    for key, value in filter_criteria.items():
                        if key in doc_info["metadata"] and doc_info["metadata"][key] != value:
                            match = False
                            break
                    
                    if not match:
                        continue
                
                results.append({
                    "document_id": doc_info["document_id"],
                    "content": doc_info["content"],
                    "similarity_score": similarity,
                    "metadata": doc_info["metadata"]
                })
            
            # Sort by similarity score and limit results
            results = sorted(results, key=lambda x: x["similarity_score"], reverse=True)[:limit]
            return results
        
        # Real implementation with ChromaDB
        # Create filter if specified
        where_clause = filter_criteria if filter_criteria else None
        
        # Query the collection
        results = self.collection.query(
            query_texts=[query],
            n_results=limit,
            where=where_clause
        )
        
        # Format the results
        formatted_results = []
        if results and len(results["ids"]) > 0:
            for i, doc_id in enumerate(results["ids"][0]):
                document_id = results["metadatas"][0][i]["document_id"]
                
                formatted_results.append({
                    "document_id": document_id,
                    "content": results["documents"][0][i],
                    "similarity_score": float(results["distances"][0][i]) if "distances" in results else 0.99,
                    "metadata": results["metadatas"][0][i]
                })
        
        return formatted_results
    
    def delete_document(self, document_id: str) -> bool:
        """
        Delete a document and all its chunks from the vector store.
        
        Args:
            document_id: The document ID to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if self.use_mock:
                # Mock implementation
                # Find and remove all chunks for the document
                chunk_ids_to_remove = []
                for chunk_id, doc_info in self.mock_documents.items():
                    if doc_info["document_id"] == document_id:
                        chunk_ids_to_remove.append(chunk_id)
                
                # Remove from mock storage
                for chunk_id in chunk_ids_to_remove:
                    if chunk_id in self.mock_vectors:
                        del self.mock_vectors[chunk_id]
                    if chunk_id in self.mock_documents:
                        del self.mock_documents[chunk_id]
                
                return True
            
            # Real implementation with ChromaDB
            # Get all chunks for the document
            results = self.collection.get(
                where={"document_id": document_id}
            )
            
            if results and len(results["ids"]) > 0:
                # Delete all chunks
                self.collection.delete(
                    ids=results["ids"]
                )
            
            return True
        except Exception as e:
            print(f"Error deleting document from vector store: {str(e)}")
            return False

    def get_document_count(self) -> int:
        """
        Get the total number of unique documents in the vector store.
        
        Returns:
            Number of documents
        """
        results = self.collection.get()
        
        # Extract unique document IDs from metadata
        document_ids = set()
        for metadata in results["metadatas"]:
            document_ids.add(metadata["document_id"])
        
        return len(document_ids) 