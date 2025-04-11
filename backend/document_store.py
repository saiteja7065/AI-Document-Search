import os
import uuid
import json
import datetime
from typing import Dict, List, Optional
import firebase_admin
from firebase_admin import credentials, firestore, storage
from config import settings

class DocumentStore:
    """
    Manages document storage and metadata using Firebase.
    """
    
    def __init__(self, use_mock=False):
        """
        Initialize the document store with Firebase credentials or use mock implementation.
        
        Args:
            use_mock: If True, use a mock implementation instead of Firebase
        """
        self.use_mock = use_mock
        
        # Use mock implementation for development without Firebase
        if self.use_mock:
            self._initialize_mock_storage()
            return
            
        # Initialize Firebase if not already initialized
        if not firebase_admin._apps:
            # For local development with a service account key file
            if os.path.exists("firebase-key.json"):
                cred = credentials.Certificate("firebase-key.json")
                firebase_admin.initialize_app(cred, {
                    'storageBucket': f"{settings.FIREBASE_PROJECT_ID}.appspot.com"
                })
            # For production with environment variables
            else:
                # Create a temporary service account key file from environment variables
                service_account_info = {
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
                    "client_email": settings.FIREBASE_CLIENT_EMAIL,
                }
                
                cred = credentials.Certificate(service_account_info)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': f"{settings.FIREBASE_PROJECT_ID}.appspot.com"
                })
        
        # Get Firestore and Storage clients
        self.db = firestore.client()
        self.bucket = storage.bucket()
        
        # Set up collection references
        self.documents_collection = self.db.collection('documents')
    
    def _initialize_mock_storage(self):
        """Initialize mock storage for development without Firebase."""
        self.mock_documents = []
        self.mock_files = {}
        print("Using mock implementation of DocumentStore")
    
    def store_document(self, file_path: str, title: str, metadata: Dict, user_id: str) -> str:
        """
        Store a document in Firebase Storage and save metadata in Firestore.
        
        Args:
            file_path: Path to the document file
            title: Document title
            metadata: Additional metadata
            user_id: ID of the user uploading the document
            
        Returns:
            Document ID
        """
        # Generate a unique ID for the document
        document_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file_path)[1]
        
        if self.use_mock:
            # Mock implementation
            file_url = f"mock://documents/{document_id}{file_extension}"
            
            # Copy the file to a mock storage location
            with open(file_path, 'rb') as f:
                file_content = f.read()
                self.mock_files[document_id] = file_content
            
            # Create document metadata
            document_data = {
                'id': document_id,
                'title': title,
                'fileName': os.path.basename(file_path),
                'fileUrl': file_url,
                'fileType': metadata.get('file_type', 'unknown'),
                'uploadedBy': user_id,
                'uploadedAt': datetime.datetime.now().isoformat(),
                'metadata': metadata,
            }
            
            # Save to mock storage
            self.mock_documents.append(document_data)
            return document_id
        
        # Real Firebase implementation
        storage_path = f"documents/{document_id}{file_extension}"
        blob = self.bucket.blob(storage_path)
        blob.upload_from_filename(file_path)
        
        # Set blob to be publicly accessible (for demo purposes only)
        blob.make_public()
        
        # Get the public URL
        file_url = blob.public_url
        
        # Prepare document metadata
        document_data = {
            'id': document_id,
            'title': title,
            'fileName': os.path.basename(file_path),
            'fileUrl': file_url,
            'fileType': metadata.get('file_type', 'unknown'),
            'uploadedBy': user_id,
            'uploadedAt': firestore.SERVER_TIMESTAMP,
            'metadata': metadata,
        }
        
        # Save metadata to Firestore
        self.documents_collection.document(document_id).set(document_data)
        
        return document_id
    
    def get_document(self, document_id: str) -> Optional[Dict]:
        """
        Get document metadata from Firestore.
        
        Args:
            document_id: The ID of the document
            
        Returns:
            Document metadata or None if not found
        """
        if self.use_mock:
            # Mock implementation
            for doc in self.mock_documents:
                if doc['id'] == document_id:
                    return doc
            return None
        
        # Real Firebase implementation
        doc_ref = self.documents_collection.document(document_id)
        doc = doc_ref.get()
        
        if doc.exists:
            return doc.to_dict()
        else:
            return None
    
    def get_documents(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict]:
        """
        Get a list of documents.
        
        Args:
            user_id: If provided, filter documents by user ID
            limit: Maximum number of documents to return
            
        Returns:
            List of document metadata
        """
        if self.use_mock:
            # Mock implementation
            docs = self.mock_documents
            
            # Filter by user if specified
            if user_id:
                docs = [doc for doc in docs if doc['uploadedBy'] == user_id]
            
            # Sort by upload date, most recent first
            docs = sorted(docs, key=lambda x: x['uploadedAt'], reverse=True)
            
            # Limit results
            return docs[:limit]
        
        # Real Firebase implementation
        query = self.documents_collection
        
        # Filter by user if specified
        if user_id:
            query = query.where('uploadedBy', '==', user_id)
        
        # Order by upload date, most recent first
        query = query.order_by('uploadedAt', direction=firestore.Query.DESCENDING).limit(limit)
        
        # Execute query
        docs = query.stream()
        
        # Convert to list of dictionaries
        return [doc.to_dict() for doc in docs]
    
    def delete_document(self, document_id: str) -> bool:
        """
        Delete a document from Firebase Storage and Firestore.
        
        Args:
            document_id: The ID of the document to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if self.use_mock:
                # Mock implementation
                # Find document index
                doc_index = None
                for i, doc in enumerate(self.mock_documents):
                    if doc['id'] == document_id:
                        doc_index = i
                        break
                
                if doc_index is not None:
                    # Remove from mock documents
                    self.mock_documents.pop(doc_index)
                    # Remove from mock files
                    if document_id in self.mock_files:
                        del self.mock_files[document_id]
                    return True
                return False
            
            # Real Firebase implementation
            # Get document metadata
            doc = self.get_document(document_id)
            
            if not doc:
                return False
            
            # Delete file from Storage
            file_url = doc.get('fileUrl', '')
            if file_url:
                # Extract blob path from URL
                blob_name = file_url.split('documents/')[1]
                blob = self.bucket.blob(f"documents/{blob_name}")
                blob.delete()
            
            # Delete document from Firestore
            self.documents_collection.document(document_id).delete()
            
            return True
        except Exception as e:
            print(f"Error deleting document: {str(e)}")
            return False
    
    def update_document_metadata(self, document_id: str, updates: Dict) -> bool:
        """
        Update document metadata in Firestore.
        
        Args:
            document_id: The ID of the document to update
            updates: Dictionary of fields to update
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if self.use_mock:
                # Mock implementation
                for i, doc in enumerate(self.mock_documents):
                    if doc['id'] == document_id:
                        # Update document
                        self.mock_documents[i] = {
                            **self.mock_documents[i],
                            **updates,
                            'updatedAt': datetime.datetime.now().isoformat()
                        }
                        return True
                return False
            
            # Real Firebase implementation
            # Update document in Firestore
            self.documents_collection.document(document_id).update(updates)
            return True
        except Exception as e:
            print(f"Error updating document: {str(e)}")
            return False 