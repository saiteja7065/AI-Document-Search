import os
import chromadb
from chromadb.config import Settings
from typing import Dict, List, Tuple
from sentence_transformers import SentenceTransformer
from config import settings

class VectorStore:
    """
    Vector storage and retrieval using ChromaDB and Sentence Transformers.
    """
    
    def __init__(self, persist_directory: str = None):
        """
        Initialize the vector store.
        
        Args:
            persist_directory: Directory to persist the vector database
        """
        self.persist_directory = persist_directory or settings.CHROMA_PERSIST_DIRECTORY
        
        # Ensure directory exists
        os.makedirs(self.persist_directory, exist_ok=True)
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=self.persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Create or get collection
        self.collection = self.client.get_or_create_collection("documents")
        
        # Initialize sentence transformer model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')  # Lightweight model for embedding
    
    def add_document(self, document_id: str, chunks: List[str], metadata: Dict = None) -> None:
        """
        Add document chunks to the vector store.
        
        Args:
            document_id: Unique identifier for the document
            chunks: Text chunks from the document
            metadata: Additional metadata about the document
        """
        # Generate embeddings for chunks
        embeddings = self.model.encode(chunks).tolist()
        
        # Prepare chunk IDs
        chunk_ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
        
        # Prepare metadata for each chunk
        metadatas = []
        for i, _ in enumerate(chunks):
            chunk_metadata = {
                "document_id": document_id,
                "chunk_index": i,
            }
            if metadata:
                chunk_metadata.update(metadata)
            metadatas.append(chunk_metadata)
        
        # Add chunks to collection
        self.collection.add(
            ids=chunk_ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )
        
        print(f"Added document {document_id} with {len(chunks)} chunks to vector store")
    
    def search(self, query: str, limit: int = 5) -> List[Dict]:
        """
        Search for documents similar to the query.
        
        Args:
            query: The search query
            limit: Maximum number of results to return
            
        Returns:
            List of search results with document chunks and metadata
        """
        # Generate embedding for query
        query_embedding = self.model.encode(query).tolist()
        
        # Search for similar chunks
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            include=["documents", "metadatas", "distances"]
        )
        
        # Format results
        formatted_results = []
        for i in range(len(results["ids"][0])):
            formatted_results.append({
                "chunk_id": results["ids"][0][i],
                "document_id": results["metadatas"][0][i]["document_id"],
                "chunk_index": results["metadatas"][0][i]["chunk_index"],
                "content": results["documents"][0][i],
                "similarity_score": 1 - results["distances"][0][i],  # Convert distance to similarity score
                "metadata": results["metadatas"][0][i]
            })
        
        return formatted_results
    
    def delete_document(self, document_id: str) -> None:
        """
        Delete a document and its chunks from the vector store.
        
        Args:
            document_id: The ID of the document to delete
        """
        # Get all chunk IDs for the document
        results = self.collection.get(
            where={"document_id": document_id}
        )
        
        # Delete chunks
        if results["ids"]:
            self.collection.delete(
                ids=results["ids"]
            )
            print(f"Deleted document {document_id} with {len(results['ids'])} chunks from vector store")
    
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