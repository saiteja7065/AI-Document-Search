import os
from typing import Dict, List, Optional
from openai import OpenAI
from config import settings

class DocumentSummarizer:
    """
    Generates summaries for documents using OpenAI's GPT models.
    """
    
    def __init__(self, api_key: str = None, model: str = "gpt-3.5-turbo"):
        """
        Initialize the document summarizer.
        
        Args:
            api_key: OpenAI API key
            model: Model to use for summarization
        """
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model
        self.client = OpenAI(api_key=self.api_key)
    
    def summarize(self, text: str, max_tokens: int = 500, summary_type: str = "general") -> str:
        """
        Generate a summary of the provided text.
        
        Args:
            text: The text to summarize
            max_tokens: Maximum tokens for the summary
            summary_type: Type of summary to generate (general, key_points, detailed)
            
        Returns:
            Generated summary as a string
        """
        # Handle long texts by truncating if necessary
        # OpenAI models have context limits
        if len(text) > 12000:
            text = text[:12000] + "..."
        
        # Create prompt based on summary type
        if summary_type == "key_points":
            prompt = (
                "Extract and list the key points from this document in bullet point format:\n\n"
                f"{text}\n\n"
                "Key points:"
            )
        elif summary_type == "detailed":
            prompt = (
                "Generate a detailed summary of this document, preserving the most important information "
                "and maintaining the original structure:\n\n"
                f"{text}\n\n"
                "Detailed summary:"
            )
        else:  # general summary
            prompt = (
                "Please summarize the following document in a concise way, highlighting the main points "
                "and important information:\n\n"
                f"{text}\n\n"
                "Summary:"
            )
        
        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that summarizes documents accurately and concisely."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.5,  # Lower temperature for more focused summary
            )
            
            # Extract and return summary
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            return "Error generating summary. Please try again."
    
    def summarize_chunks(self, chunks: List[str], max_tokens: int = 500, summary_type: str = "general") -> str:
        """
        Generate a summary from multiple document chunks.
        
        Args:
            chunks: List of text chunks to summarize
            max_tokens: Maximum tokens for the summary
            summary_type: Type of summary to generate
            
        Returns:
            Generated summary as a string
        """
        # Combine chunks into a single text
        combined_text = " ".join(chunks)
        
        # Generate summary
        return self.summarize(combined_text, max_tokens, summary_type) 