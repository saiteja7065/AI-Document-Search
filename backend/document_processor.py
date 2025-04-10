import os
import PyPDF2
import docx
from typing import Dict, List, Optional, Tuple
from langchain.text_splitter import RecursiveCharacterTextSplitter

class DocumentProcessor:
    """
    Processes different document types and extracts text content.
    Supports PDF, DOCX, and TXT files.
    """
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Initialize the document processor.
        
        Args:
            chunk_size: The size of text chunks for processing
            chunk_overlap: The overlap between chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )
    
    def process_file(self, file_path: str) -> Dict:
        """
        Process a file and extract its content.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Dict containing the extracted text and metadata
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            return self._process_pdf(file_path)
        elif file_extension == '.docx':
            return self._process_docx(file_path)
        elif file_extension == '.txt':
            return self._process_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
    
    def _process_pdf(self, file_path: str) -> Dict:
        """Process PDF files and extract text."""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                num_pages = len(reader.pages)
                text = ""
                
                for page_num in range(num_pages):
                    page = reader.pages[page_num]
                    text += page.extract_text() + "\n"
                
                chunks = self._split_text(text)
                
                return {
                    'text': text,
                    'chunks': chunks,
                    'metadata': {
                        'source': file_path,
                        'file_type': 'pdf',
                        'page_count': num_pages,
                    }
                }
        except Exception as e:
            raise Exception(f"Error processing PDF file: {str(e)}")
    
    def _process_docx(self, file_path: str) -> Dict:
        """Process DOCX files and extract text."""
        try:
            doc = docx.Document(file_path)
            text = ""
            
            for para in doc.paragraphs:
                text += para.text + "\n"
            
            chunks = self._split_text(text)
            
            return {
                'text': text,
                'chunks': chunks,
                'metadata': {
                    'source': file_path,
                    'file_type': 'docx',
                    'paragraph_count': len(doc.paragraphs),
                }
            }
        except Exception as e:
            raise Exception(f"Error processing DOCX file: {str(e)}")
    
    def _process_txt(self, file_path: str) -> Dict:
        """Process TXT files and extract text."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
            
            chunks = self._split_text(text)
            
            return {
                'text': text,
                'chunks': chunks,
                'metadata': {
                    'source': file_path,
                    'file_type': 'txt',
                }
            }
        except Exception as e:
            raise Exception(f"Error processing TXT file: {str(e)}")
    
    def _split_text(self, text: str) -> List[str]:
        """
        Split text into chunks for processing.
        
        Args:
            text: The text to split
            
        Returns:
            List of text chunks
        """
        return self.text_splitter.split_text(text) 