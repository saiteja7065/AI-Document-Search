from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Query, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict
import os
import shutil
import uuid
import tempfile
from pydantic import BaseModel
from dotenv import load_dotenv

# Import our modules
from document_processor import DocumentProcessor
from vector_store import VectorStore
from document_store import DocumentStore
from summarizer import DocumentSummarizer
from config import settings

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Document Search API",
    description="API for AI-powered document search and retrieval",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize our core services
document_processor = DocumentProcessor()
vector_store = VectorStore()
document_store = DocumentStore()
summarizer = DocumentSummarizer()

# Create temporary directory for file uploads
os.makedirs("temp", exist_ok=True)

# Pydantic models for API
class DocumentResponse(BaseModel):
    id: str
    title: str
    file_url: Optional[str]
    file_type: str
    uploaded_at: Optional[str]
    uploaded_by: str

class SearchResponse(BaseModel):
    document_id: str
    title: str
    file_type: str
    snippet: str
    similarity_score: float

class SummaryResponse(BaseModel):
    summary: str
    document_id: str
    title: str

# Helper functions
def get_user_id_from_token(token: str) -> str:
    # In a real app, decode and validate the token
    # For this demo, we'll just return a fixed user ID
    return "demo_user"

@app.get("/")
async def root():
    return {"message": "Welcome to AI Document Search API"}

@app.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    token: str = Depends(oauth2_scheme)
):
    """
    Upload a document for processing and indexing
    """
    try:
        # Get user ID from token
        user_id = get_user_id_from_token(token)
        
        # Check file type
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in ['.pdf', '.docx', '.txt']:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file_extension}. Supported types are: .pdf, .docx, .txt"
            )
        
        # Save file to temporary location
        temp_file_path = f"temp/{str(uuid.uuid4())}{file_extension}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process document to extract text and metadata
        try:
            processed_data = document_processor.process_file(temp_file_path)
            
            # Store document in Firebase
            document_id = document_store.store_document(
                file_path=temp_file_path,
                title=title,
                metadata=processed_data['metadata'],
                user_id=user_id
            )
            
            # Add document to vector store for search
            vector_store.add_document(
                document_id=document_id,
                chunks=processed_data['chunks'],
                metadata=processed_data['metadata']
            )
            
            # Get document metadata
            doc_metadata = document_store.get_document(document_id)
            
            return DocumentResponse(
                id=document_id,
                title=title,
                file_url=doc_metadata.get('fileUrl', ''),
                file_type=doc_metadata.get('fileType', ''),
                uploaded_at=str(doc_metadata.get('uploadedAt', '')),
                uploaded_by=user_id
            )
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search", response_model=List[SearchResponse])
async def search_documents(
    query: str = Body(..., embed=True),
    limit: int = Body(5, embed=True),
    token: str = Depends(oauth2_scheme)
):
    """
    Search documents using natural language query
    """
    try:
        # Get user ID from token
        user_id = get_user_id_from_token(token)
        
        # Search in vector store
        search_results = vector_store.search(query=query, limit=limit)
        
        # Format results
        formatted_results = []
        for result in search_results:
            # Get document metadata
            doc_id = result['document_id']
            doc_metadata = document_store.get_document(doc_id)
            
            if doc_metadata:
                formatted_results.append(SearchResponse(
                    document_id=doc_id,
                    title=doc_metadata.get('title', 'Untitled Document'),
                    file_type=doc_metadata.get('fileType', 'unknown'),
                    snippet=result['content'][:200] + "...",
                    similarity_score=result['similarity_score']
                ))
        
        return formatted_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents", response_model=List[DocumentResponse])
async def get_documents(
    token: str = Depends(oauth2_scheme),
    limit: int = Query(50)
):
    """
    Get a list of documents
    """
    try:
        # Get user ID from token
        user_id = get_user_id_from_token(token)
        
        # Get documents from document store
        documents = document_store.get_documents(user_id=user_id, limit=limit)
        
        # Format results
        return [
            DocumentResponse(
                id=doc['id'],
                title=doc.get('title', 'Untitled Document'),
                file_url=doc.get('fileUrl', ''),
                file_type=doc.get('fileType', 'unknown'),
                uploaded_at=str(doc.get('uploadedAt', '')),
                uploaded_by=doc.get('uploadedBy', '')
            )
            for doc in documents
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{document_id}")
async def get_document(
    document_id: str,
    token: str = Depends(oauth2_scheme)
):
    """
    Get a specific document
    """
    try:
        # Get user ID from token
        user_id = get_user_id_from_token(token)
        
        # Get document from document store
        document = document_store.get_document(document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return document
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{document_id}/summary", response_model=SummaryResponse)
async def get_document_summary(
    document_id: str,
    summary_type: str = Query("general"),
    max_tokens: int = Query(500),
    token: str = Depends(oauth2_scheme)
):
    """
    Generate a summary for a specific document
    """
    try:
        # Get user ID from token
        user_id = get_user_id_from_token(token)
        
        # Get document from document store
        document = document_store.get_document(document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get document chunks from vector store
        results = vector_store.collection.get(
            where={"document_id": document_id}
        )
        
        if not results["documents"]:
            raise HTTPException(status_code=404, detail="Document content not found in vector store")
        
        # Sort chunks by chunk index
        sorted_chunks = []
        for i, metadata in enumerate(results["metadatas"]):
            sorted_chunks.append({
                "chunk_index": metadata["chunk_index"],
                "content": results["documents"][i]
            })
        
        sorted_chunks.sort(key=lambda x: x["chunk_index"])
        chunks = [chunk["content"] for chunk in sorted_chunks]
        
        # Generate summary
        summary = summarizer.summarize_chunks(chunks, max_tokens, summary_type)
        
        return SummaryResponse(
            summary=summary,
            document_id=document_id,
            title=document.get('title', 'Untitled Document')
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    token: str = Depends(oauth2_scheme)
):
    """
    Delete a document
    """
    try:
        # Get user ID from token
        user_id = get_user_id_from_token(token)
        
        # Get document to check if it exists
        document = document_store.get_document(document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete from vector store
        vector_store.delete_document(document_id)
        
        # Delete from document store
        success = document_store.delete_document(document_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete document")
        
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/documents", response_model=List[DocumentResponse])
async def admin_get_documents(
    token: str = Depends(oauth2_scheme),
    limit: int = Query(50)
):
    """
    Admin endpoint to get all documents
    """
    try:
        # Get documents from document store without filtering by user
        documents = document_store.get_documents(limit=limit)
        
        # Format results
        return [
            DocumentResponse(
                id=doc['id'],
                title=doc.get('title', 'Untitled Document'),
                file_url=doc.get('fileUrl', ''),
                file_type=doc.get('fileType', 'unknown'),
                uploaded_at=str(doc.get('uploadedAt', '')),
                uploaded_by=doc.get('uploadedBy', '')
            )
            for doc in documents
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats(
    token: str = Depends(oauth2_scheme)
):
    """
    Get system statistics
    """
    try:
        # Get document count
        document_count = vector_store.get_document_count()
        
        return {
            "document_count": document_count,
            "vector_store_size": len(vector_store.collection.get()["ids"]) if vector_store.collection.get()["ids"] else 0,
            "supported_file_types": settings.ALLOWED_FILE_TYPES,
            "api_version": app.version
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 