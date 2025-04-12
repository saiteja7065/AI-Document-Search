import os
import uuid
import json
import datetime
from typing import Dict, List, Any, Optional
import firebase_admin
from firebase_admin import credentials, firestore, storage
from config import settings

class DocumentStore:
    """
    Manages document storage and metadata using Firebase.
    """
    
    def __init__(self, use_mock: bool = False):
        """
        Initialize the document store with Firebase credentials or use mock implementation.
        
        Args:
            use_mock: If True, use a mock implementation instead of Firebase
        """
        self.use_mock = use_mock
        
        if not use_mock:
            # Initialize Firebase if not already initialized
            if not firebase_admin._apps:
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
                    "client_email": settings.FIREBASE_CLIENT_EMAIL
                })
                firebase_admin.initialize_app(cred, {
                    'storageBucket': f"{settings.FIREBASE_PROJECT_ID}.appspot.com"
                })
            
            self.db = firestore.client()
            self.bucket = storage.bucket()
        else:
            self._initialize_mock_storage()
    
    def _initialize_mock_storage(self):
        """Initialize mock storage for development without Firebase."""
        self.mock_documents = []
        self.mock_files = {}
        print("Using mock implementation of DocumentStore")
    
    def store_document(self, file_path: str, metadata: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Store a document in Firebase Storage and save metadata in Firestore.
        
        Args:
            file_path: Path to the document file
            metadata: Additional metadata
            user_id: ID of the user uploading the document
            
        Returns:
            Document metadata
        """
        if self.use_mock:
            return {"id": str(uuid.uuid4()), "title": metadata.get("title", "Mock Document")}
            
        try:
            # Generate unique ID
            doc_id = str(uuid.uuid4())
            
            # Upload file to Firebase Storage
            blob = self.bucket.blob(f"documents/{doc_id}/{metadata['filename']}")
            blob.upload_from_filename(file_path)
            
            # Make file publicly accessible and get URL
            blob.make_public()
            file_url = blob.public_url
            
            # Store metadata in Firestore
            doc_data = {
                "id": doc_id,
                "title": metadata.get("title", "Untitled"),
                "fileUrl": file_url,
                "fileType": metadata.get("file_type", "unknown"),
                "fileName": metadata.get("filename", ""),
                "fileSize": metadata.get("file_size", 0),
                "uploadedBy": user_id,
                "uploadedAt": datetime.datetime.now(),
                "metadata": metadata,
                "tags": []
            }
            
            self.db.collection("documents").document(doc_id).set(doc_data)
            return doc_data
            
        except Exception as e:
            raise Exception(f"Failed to store document: {str(e)}")
    
    def get_documents(self, user_id: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get a list of documents.
        
        Args:
            user_id: If provided, filter documents by user ID
            limit: Maximum number of documents to return
            
        Returns:
            List of document metadata
        """
        if self.use_mock:
            return []
            
        try:
            # Query documents
            query = self.db.collection("documents")
            if user_id:
                query = query.where("uploadedBy", "==", user_id)
            
            docs = query.limit(limit).get()
            return [doc.to_dict() for doc in docs]
            
        except Exception as e:
            raise Exception(f"Failed to get documents: {str(e)}")
    
    def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Get document metadata from Firestore.
        
        Args:
            document_id: The ID of the document
            
        Returns:
            Document metadata or None if not found
        """
        if self.use_mock:
            return None
            
        try:
            doc = self.db.collection("documents").document(document_id).get()
            return doc.to_dict() if doc.exists else None
            
        except Exception as e:
            raise Exception(f"Failed to get document: {str(e)}")
    
    def delete_document(self, document_id: str):
        """
        Delete a document from Firebase Storage and Firestore.
        
        Args:
            document_id: The ID of the document to delete
        """
        if self.use_mock:
            return
            
        try:
            # Get document data
            doc = self.db.collection("documents").document(document_id).get()
            if not doc.exists:
                return
                
            doc_data = doc.to_dict()
            
            # Delete file from storage
            if "fileName" in doc_data:
                blob = self.bucket.blob(f"documents/{document_id}/{doc_data['fileName']}")
                blob.delete()
                
            # Delete document metadata
            self.db.collection("documents").document(document_id).delete()
            
        except Exception as e:
            raise Exception(f"Failed to delete document: {str(e)}")
    
    def update_document_tags(self, document_id: str, tags: List[str]):
        """
        Update document tags in Firestore.
        
        Args:
            document_id: The ID of the document to update
            tags: List of tags to update
        """
        if self.use_mock:
            return
            
        try:
            self.db.collection("documents").document(document_id).update({
                "tags": tags
            })
        except Exception as e:
            raise Exception(f"Failed to update document tags: {str(e)}")
    
    def get_documents_by_tag(self, tag_id: str) -> List[Dict[str, Any]]:
        """
        Get all documents with a specific tag.
        
        Args:
            tag_id: The tag to filter documents by
            
        Returns:
            List of document metadata
        """
        if self.use_mock:
            return []
            
        try:
            docs = self.db.collection("documents").where("tags", "array_contains", tag_id).get()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            raise Exception(f"Failed to get documents by tag: {str(e)}")