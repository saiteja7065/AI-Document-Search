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
    
    def __init__(self):
        """Initialize the document store with Firebase credentials."""
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
        
        # Upload file to Firebase Storage
        file_extension = os.path.splitext(file_path)[1]
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
            # Update document in Firestore
            self.documents_collection.document(document_id).update(updates)
            return True
        except Exception as e:
            print(f"Error updating document: {str(e)}")
            return False 