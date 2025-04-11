# AI-Based Document Search & Retrieval Assistant

An AI-powered web application that helps users efficiently search through and extract insights from multiple document types using natural language queries.

## Features

- Natural language document search
- Document summarization
- Support for multiple document formats (PDF, DOCX, TXT)
- User authentication with Clerk
- Related content suggestions
- Document tagging and organization
- Advanced document insights
- Responsive web interface

## Tech Stack

### Frontend
- React.js
- Material-UI
- React Context API
- Clerk Authentication

### Backend
- Python with FastAPI
- OpenAI API / Hugging Face models
- Chroma Vector Database
- Firebase Storage & Firestore

## Project Structure

```
.
├── frontend/           # React frontend application
├── backend/           # FastAPI backend application
└── README.md         # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.9 or higher)
- Firebase account (optional for development)
- OpenAI API key (optional for development)

### Backend Setup
1. Navigate to the backend directory
   ```
   cd backend
   ```

2. Create a virtual environment
   ```
   python -m venv venv
   ```

3. Activate virtual environment
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```
     source venv/bin/activate
     ```

4. Install dependencies
   ```
   pip install -r requirements.txt
   ```

5. Create a `.env` file based on `.env.example`
   - For development, the mock implementations will be used by default
   - For production, you'll need to configure Firebase and other services

6. Start development server
   ```
   uvicorn main:app --reload
   ```
   
7. The API will be available at http://localhost:8000

### Frontend Setup
1. Navigate to the frontend directory
   ```
   cd frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```
   # Clerk Authentication
   REACT_APP_CLERK_PUBLISHABLE_KEY=your-clerk-key

   # API Configuration
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_API_VERSION=v1
   ```

4. Start development server
   ```
   npm start
   ```

5. The app will be available at http://localhost:3000

## Development Mode

The application includes mock implementations for development:

- In `backend/main.py`, the variable `USE_MOCK_SERVICES` is set to `True` by default
- This enables development without Firebase or other external services
- For real implementations, set it to `False` and configure proper credentials

## API Endpoints

The backend provides the following key endpoints:

- `POST /upload` - Upload a document
- `POST /search` - Search documents with natural language query
- `GET /documents` - List all documents
- `GET /documents/{document_id}` - Get specific document
- `GET /documents/{document_id}/summary` - Get document summary
- `POST /documents/{document_id}/ask` - Ask questions about a document
- `GET /documents/{document_id}/insights` - Get document insights
- `GET /documents/{document_id}/related` - Get related documents

## License

MIT License 