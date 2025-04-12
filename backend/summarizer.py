from typing import Dict, Any
from langchain.chat_models import ChatOpenAI
from langchain.chains.summarize import load_summarize_chain
from langchain.docstore.document import Document
from langchain.prompts import PromptTemplate
import os
from config import settings

class DocumentSummarizer:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0,
            model_name="gpt-3.5-turbo-16k",
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        # Custom prompt for better summaries
        self.summary_prompt = PromptTemplate(
            input_variables=["text"],
            template="""Create a comprehensive summary of the following text. Include:
            1. Main topics and key points
            2. Important findings or conclusions
            3. Any significant data or statistics
            
            Text: {text}
            
            Summary:"""
        )
        
    def generate_summary(self, text: str, summary_type: str = "general", max_tokens: int = 500) -> Dict[str, Any]:
        """Generate a summary of the document"""
        try:
            # Split text into chunks if it's too long
            docs = [Document(page_content=chunk) for chunk in self._split_text(text)]
            
            # Choose summarization strategy based on summary type
            if summary_type == "bullet_points":
                summary_chain = self._create_bullet_point_chain()
            else:
                summary_chain = self._create_general_chain()
                
            # Generate summary
            summary = summary_chain.run(docs)
            
            # Extract key points
            key_points = self._extract_key_points(summary)
            
            return {
                "summary": summary,
                "key_points": key_points,
                "word_count": len(summary.split()),
                "summary_type": summary_type
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "summary": "Failed to generate summary",
                "key_points": []
            }
            
    def _split_text(self, text: str, max_chunk_size: int = 4000) -> list:
        """Split text into chunks for processing"""
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0
        
        for word in words:
            word_size = len(word) + 1  # +1 for space
            if current_size + word_size > max_chunk_size:
                chunks.append(" ".join(current_chunk))
                current_chunk = [word]
                current_size = word_size
            else:
                current_chunk.append(word)
                current_size += word_size
                
        if current_chunk:
            chunks.append(" ".join(current_chunk))
            
        return chunks
        
    def _create_general_chain(self):
        """Create a chain for general summarization"""
        return load_summarize_chain(
            llm=self.llm,
            chain_type="map_reduce",
            map_prompt=self.summary_prompt,
            combine_prompt=self.summary_prompt,
            verbose=False
        )
        
    def _create_bullet_point_chain(self):
        """Create a chain for bullet point summarization"""
        bullet_prompt = PromptTemplate(
            input_variables=["text"],
            template="""Extract the main points from the following text as a bulleted list:
            
            Text: {text}
            
            Main Points:"""
        )
        return load_summarize_chain(
            llm=self.llm,
            chain_type="map_reduce",
            map_prompt=bullet_prompt,
            combine_prompt=bullet_prompt,
            verbose=False
        )
        
    def _extract_key_points(self, summary: str) -> list:
        """Extract key points from the summary"""
        prompt = f"""Extract 3-5 key points from this summary as a list:
        {summary}
        """
        
        try:
            response = self.llm.predict(prompt)
            # Split by newlines and clean up
            points = [p.strip().lstrip('•-*').strip() for p in response.split('\n') if p.strip()]
            return points[:5]  # Limit to 5 points
        except:
            return []