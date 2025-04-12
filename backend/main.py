from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Form, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from typing import List, Optional, Dict
import os
import shutil
import uuid
import tempfile
from pydantic import BaseModel
from dotenv import load_dotenv
import datetime
import random
from gtts import gTTS
import openai

# Import our modules
from document_processor import DocumentProcessor
from vector_store import VectorStore
from document_store import DocumentStore
from summarizer import DocumentSummarizer
from config import settings

# Load environment variables
load_dotenv()

# Determine whether to use mock services
USE_MOCK_SERVICES = True  # Set this to False when ready to use real Firebase and ChromaDB

# Add OpenAI API key for GPT-based features
openai.api_key = os.getenv("OPENAI_API_KEY")

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

# Initialize our core services
document_processor = DocumentProcessor()
vector_store = VectorStore(use_mock=False)
document_store = DocumentStore(use_mock=False)
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

# Tag-related models
class Tag(BaseModel):
    id: Optional[str] = None
    name: str
    color: str

class TagResponse(BaseModel):
    id: str
    name: str
    color: str

class TagCreate(BaseModel):
    name: str
    color: str = "#2196f3"  # Default blue color

# Mock tag storage for development
mock_tags = [
    {"id": "tag-1", "name": "Important", "color": "#f44336"},
    {"id": "tag-2", "name": "Work", "color": "#2196f3"},
    {"id": "tag-3", "name": "Personal", "color": "#4caf50"},
    {"id": "tag-4", "name": "Archived", "color": "#9e9e9e"},
    {"id": "tag-5", "name": "Confidential", "color": "#ff9800"}
]

# Mock document-tag relationships
mock_document_tags = []  # List of (document_id, tag_id) tuples

# Admin user IDs - in a real app, this would be in a database
ADMIN_USER_IDS = ["admin", "testuser"]

@app.get("/")
async def root():
    return {"message": "Welcome to AI Document Search API"}

@app.get("/tags", response_model=List[TagResponse])
async def get_tags():
    """
    Get all available tags
    """
    try:
        # In a real implementation, get tags from database
        # For now, return mock tags
        return [TagResponse(**tag) for tag in mock_tags]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tags", response_model=TagResponse)
async def create_tag(tag: TagCreate):
    """
    Create a new tag
    """
    try:
        # Generate a unique ID for the tag
        tag_id = f"tag-{str(uuid.uuid4())[:8]}"
        
        # Create new tag
        new_tag = {
            "id": tag_id,
            "name": tag.name,
            "color": tag.color
        }
        
        # In a real implementation, save to database
        # For now, add to mock tags
        mock_tags.append(new_tag)
        
        return TagResponse(**new_tag)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{document_id}/tags", response_model=List[TagResponse])
async def get_document_tags(document_id: str):
    """
    Get tags for a specific document
    """
    try:
        # Get document from document store
        document = document_store.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # In a real implementation, get tags from database
        # For now, filter mock document tags
        tag_ids = [tag_id for doc_id, tag_id in mock_document_tags if doc_id == document_id]
        document_tags = [tag for tag in mock_tags if tag["id"] in tag_ids]
        
        return [TagResponse(**tag) for tag in document_tags]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/{document_id}/tags")
async def add_tags_to_document(document_id: str, tag_ids: List[str] = Body(...)):
    """
    Add tags to a document
    """
    try:
        # Get document from document store
        document = document_store.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Validate tag IDs
        valid_tag_ids = [tag["id"] for tag in mock_tags]
        for tag_id in tag_ids:
            if tag_id not in valid_tag_ids:
                raise HTTPException(status_code=400, detail=f"Invalid tag ID: {tag_id}")
        
        # In a real implementation, save to database
        # For now, add to mock document tags
        for tag_id in tag_ids:
            # Only add if not already associated
            if (document_id, tag_id) not in mock_document_tags:
                mock_document_tags.append((document_id, tag_id))
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{document_id}/tags/{tag_id}")
async def remove_tag_from_document(document_id: str, tag_id: str):
    """
    Remove a tag from a document
    """
    try:
        # Get document from document store
        document = document_store.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Validate tag ID
        valid_tag_ids = [tag["id"] for tag in mock_tags]
        if tag_id not in valid_tag_ids:
            raise HTTPException(status_code=400, detail=f"Invalid tag ID: {tag_id}")
        
        # In a real implementation, remove from database
        # For now, remove from mock document tags
        if (document_id, tag_id) in mock_document_tags:
            mock_document_tags.remove((document_id, tag_id))
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tags/{tag_id}/documents", response_model=List[DocumentResponse])
async def get_documents_by_tag(tag_id: str):
    """
    Get documents with a specific tag
    """
    try:
        # Validate tag ID
        valid_tag_ids = [tag["id"] for tag in mock_tags]
        if tag_id not in valid_tag_ids:
            raise HTTPException(status_code=400, detail=f"Invalid tag ID: {tag_id}")
        
        # In a real implementation, query database
        # For now, filter mock document tags
        document_ids = [doc_id for doc_id, tid in mock_document_tags if tid == tag_id]
        
        # Get document details
        documents = []
        for doc_id in document_ids:
            doc = document_store.get_document(doc_id)
            if doc:
                documents.append(DocumentResponse(
                    id=doc['id'],
                    title=doc.get('title', 'Untitled Document'),
                    file_url=doc.get('fileUrl', ''),
                    file_type=doc.get('fileType', 'unknown'),
                    uploaded_at=str(doc.get('uploadedAt', '')),
                    uploaded_by=doc.get('uploadedBy', '')
                ))
        
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...), title: str = Form(...)):
    """
    Upload a document for processing and indexing
    """
    try:
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
                user_id="demo_user"
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
                uploaded_by="demo_user"
            )
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search", response_model=List[SearchResponse])
async def search_documents(query: str = Body(..., embed=True), limit: int = Body(5, embed=True)):
    """
    Search documents using natural language query
    """
    try:
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
async def get_documents(limit: int = Query(50)):
    """
    Get a list of documents
    """
    try:
        # Get documents from document store
        documents = document_store.get_documents(user_id="demo_user", limit=limit)
        
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
async def get_document(document_id: str):
    """
    Get a specific document
    """
    try:
        # Get document from document store
        document = document_store.get_document(document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return document
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{document_id}/summary", response_model=SummaryResponse)
async def get_document_summary(document_id: str, summary_type: str = Query("general"), max_tokens: int = Query(500)):
    """
    Generate a summary for a specific document
    """
    try:
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
async def delete_document(document_id: str):
    """
    Delete a document
    """
    try:
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
async def admin_get_documents(limit: int = Query(50)):
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

@app.get("/admin/stats")
async def admin_get_stats():
    """
    Admin endpoint to get detailed system statistics
    """
    try:
        # Get all documents
        documents = document_store.get_documents(limit=1000)
        
        # Calculate statistics
        doc_count = len(documents)
        
        # Count documents by file type
        file_types = {}
        for doc in documents:
            file_type = doc.get('fileType', 'unknown')
            file_types[file_type] = file_types.get(file_type, 0) + 1
        
        # Count documents by user
        user_docs = {}
        for doc in documents:
            user = doc.get('uploadedBy', 'unknown')
            user_docs[user] = user_docs.get(user, 0) + 1
        
        # Convert to sorted lists for better readability
        file_type_stats = [{"type": k, "count": v} for k, v in file_types.items()]
        file_type_stats.sort(key=lambda x: x["count"], reverse=True)
        
        user_stats = [{"user_id": k, "document_count": v} for k, v in user_docs.items()]
        user_stats.sort(key=lambda x: x["document_count"], reverse=True)
        
        # Calculate mock storage usage (in a real app, this would be actual storage metrics)
        storage_usage = sum(doc.get('fileSize', 0) for doc in documents if 'fileSize' in doc)
        
        return {
            "total_documents": doc_count,
            "documents_by_type": file_type_stats,
            "documents_by_user": user_stats,
            "storage_usage": storage_usage,
            "vector_store_chunks": len(vector_store.collection.get()["ids"]) if not USE_MOCK_SERVICES else "N/A",
            "system_status": "healthy",
            "api_version": app.version,
            "timestamp": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{document_id}/insights")
async def get_document_insights(document_id: str):
    """
    Get insights from a document such as sentiment analysis,
    readability metrics, and topic modeling
    """
    try:
        # Get document from document store
        document = document_store.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get document text (in a real implementation, get from file contents)
        document_title = document.get('title', 'Untitled')
        
        # Create mock insights for development
        insights = {
            "document_id": document_id,
            "title": document_title,
            "sentiment_analysis": {
                "overall_sentiment": "positive",
                "confidence": 0.87,
                "sentiment_breakdown": {
                    "positive": 0.72,
                    "neutral": 0.25,
                    "negative": 0.03
                }
            },
            "topic_modeling": {
                "main_topics": [
                    { "name": "Business Strategy", "relevance": 0.85 },
                    { "name": "Financial Analysis", "relevance": 0.65 },
                    { "name": "Market Research", "relevance": 0.58 },
                    { "name": "Technology Implementation", "relevance": 0.42 }
                ],
                "topic_distribution": {
                    "Strategic Planning": 32,
                    "Resource Allocation": 28,
                    "Performance Metrics": 24,
                    "Risk Assessment": 16
                }
            },
            "readability": {
                "score": 65,
                "grade_level": "College",
                "reading_time": "5 minutes",
                "complexity": "Moderate"
            },
            "keywords": [
                { "word": "strategy", "frequency": 14, "relevance": 0.92 },
                { "word": "implementation", "frequency": 9, "relevance": 0.85 },
                { "word": "analysis", "frequency": 8, "relevance": 0.83 },
                { "word": "performance", "frequency": 7, "relevance": 0.78 },
                { "word": "resources", "frequency": 6, "relevance": 0.72 }
            ],
            "generated_at": datetime.datetime.now().isoformat()
        }
        
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{document_id}/related")
async def get_related_documents(document_id: str, limit: int = Query(3)):
    """
    Get documents related to the specified document
    """
    try:
        # Get document from document store
        document = document_store.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # In a real implementation, use vector similarity to find related docs
        # For now, just return other documents
        all_docs = document_store.get_documents(limit=10)
        
        # Filter out the current document and limit results
        related_docs = [
            doc for doc in all_docs
            if doc['id'] != document_id
        ][:limit]
        
        # Add mock relatedness scores
        results = []
        for doc in related_docs:
            results.append({
                "document_id": doc['id'],
                "title": doc.get('title', 'Untitled'),
                "file_type": doc.get('fileType', 'unknown'),
                "relatedness_score": round(random.uniform(0.5, 0.95), 2),
                "uploaded_at": doc.get('uploadedAt', '')
            })
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/{document_id}/ask")
async def ask_document_question(document_id: str, question: str = Body(..., embed=True)):
    """
    Ask a question about a document and get an answer
    """
    try:
        # Get document from document store
        document = document_store.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # In a real implementation, use RAG to answer the question
        # For now, return a mock answer
        return {
            "document_id": document_id,
            "question": question,
            "answer": f"Based on the document '{document.get('title')}', the answer to your question about '{question}' would involve analyzing the key points discussed in the document. The document discusses various aspects related to this topic and provides valuable insights that can address your specific query.",
            "confidence": 0.85,
            "generated_at": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{document_id}/enhanced-summary")
async def get_enhanced_document_summary(
    document_id: str,
    summary_type: str = Query("comprehensive"),
    include_key_points: bool = Query(True),
    include_tags: bool = Query(True),
    include_entities: bool = Query(True),
    max_length: int = Query(1000)
):
    """
    Generate an enhanced summary of a document with additional insights
    """
    try:
        # Get document from document store
        document = document_store.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get basic summary
        summary_response = await get_document_summary(
            document_id=document_id,
            summary_type="detailed",
            max_tokens=max_length
        )
        
        # Create enhanced summary response
        result = {
            "document_id": document_id,
            "title": document.get('title', 'Untitled'),
            "summary_type": summary_type,
            "summary": summary_response.summary,
            "generated_at": datetime.datetime.now().isoformat()
        }
        
        # Add key points if requested
        if include_key_points:
            result["key_points"] = [
                f"The document discusses important information related to {document.get('title')}",
                "Several methodologies and approaches are outlined in detail",
                "Data analysis reveals significant patterns worth further investigation",
                "Recommendations focus on practical implementation steps",
                "Multiple stakeholders are identified with specific action items"
            ]
        
        # Add tags if requested (mock implementation)
        if include_tags:
            result["tags"] = [
                {"id": "tag-1", "name": "Important", "color": "#f44336"},
                {"id": "tag-2", "name": "Work", "color": "#2196f3"}
            ]
        
        # Add named entities if requested
        if include_entities:
            result["named_entities"] = {
                "organizations": ["Company XYZ", "Department A", "Team Alpha"],
                "people": ["John Smith", "Mary Johnson", "Technical Lead"],
                "locations": ["Headquarters", "Branch Office", "Meeting Room 3"],
                "dates": ["Q3 2023", "March 15th", "Next fiscal year"],
                "products": ["Product Z", "System X", "Framework Y"]
            }
        
        # Add document metadata
        result["metadata"] = {
            "file_type": document.get('fileType', 'unknown'),
            "uploaded_at": document.get('uploadedAt', ''),
            "last_modified": document.get('updatedAt', document.get('uploadedAt', ''))
        }
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/{document_id}/key-points")
async def generate_key_points(document_id: str):
    """
    Generate key points for a document
    """
    try:
        document = document_store.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Use OpenAI to generate key points
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=f"Extract key points from the following document:\n{document['content']}",
            max_tokens=150
        )
        key_points = response.choices[0].text.strip().split("\n")

        return {"document_id": document_id, "key_points": key_points}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/{document_id}/generate-slides")
async def generate_slides(document_id: str):
    """
    Generate slides for a document
    """
    try:
        document = document_store.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Use OpenAI to generate slide content
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=f"Create slide content for the following document:\n{document['content']}",
            max_tokens=300
        )
        slides = response.choices[0].text.strip().split("\n\n")

        return {"document_id": document_id, "slides": slides}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/{document_id}/generate-image")
async def generate_image(document_id: str, description: str = Body(...)):
    """
    Generate an image based on the document content
    """
    try:
        # Use OpenAI DALL-E to generate an image
        response = openai.Image.create(
            prompt=description,
            n=1,
            size="512x512"
        )
        image_url = response['data'][0]['url']

        return {"document_id": document_id, "image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/{document_id}/voice")
async def generate_voice(document_id: str):
    """
    Generate voice narration for a document
    """
    try:
        document = document_store.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Use gTTS to generate voice
        tts = gTTS(text=document['content'], lang='en')
        temp_file = f"temp/{document_id}.mp3"
        tts.save(temp_file)

        return FileResponse(temp_file, media_type="audio/mpeg", filename=f"{document_id}.mp3")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)