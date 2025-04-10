# AI-Based Document Search & Retrieval Assistant

An AI-powered web application that helps users efficiently search through and extract insights from multiple document types using natural language queries.

## Features

- Natural language document search
- Document summarization
- Support for multiple document formats (PDF, DOCX, TXT)
- User authentication with Clerk
- Related content suggestions
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
├── docs/             # Documentation
└── README.md         # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.9 or higher)
- Firebase account
- OpenAI API key or Hugging Face account

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Create a `.env` file with required environment variables
4. Start development server: `npm run dev`

### Backend Setup
1. Navigate to the backend directory
2. Create a virtual environment: `python -m venv venv`
3. Activate virtual environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file with required environment variables
6. Start development server: `uvicorn main:app --reload`

## Development Status

This project is currently in development as part of a hackathon. The MVP will focus on core functionality with a limited set of documents.

## License

MIT License 