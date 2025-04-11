#!/usr/bin/env python3
"""
Test script for AI Document Search API

This script tests the core functionality of the backend API.
"""

import requests
import json
import os
import time

# API configuration
BASE_URL = "http://localhost:8000"

def test_api():
    print("Testing AI Document Search API...")
    
    # Get API status
    response = requests.get(f"{BASE_URL}/")
    print(f"API Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Get authentication token
    print("\nGetting authentication token...")
    auth_response = requests.post(
        f"{BASE_URL}/token",
        data={"username": "testuser", "password": "testpassword"}
    )
    
    if auth_response.status_code != 200:
        print(f"Error getting token: {auth_response.status_code}")
        print(f"Response: {auth_response.text}")
        return
    
    token = auth_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Token obtained: {token[:20]}...")
    
    # Test getting tags
    print("\nTesting GET /tags...")
    tags_response = requests.get(f"{BASE_URL}/tags", headers=headers)
    print(f"Status: {tags_response.status_code}")
    try:
        tags = tags_response.json()
        print(f"Found {len(tags)} tags")
        for tag in tags:
            print(f"  - {tag['name']} ({tag['id']})")
    except:
        print(f"Error parsing response: {tags_response.text}")
    
    # Test creating a tag
    print("\nTesting POST /tags...")
    new_tag = {"name": "Test Tag", "color": "#9c27b0"}
    create_tag_response = requests.post(
        f"{BASE_URL}/tags",
        headers=headers,
        json=new_tag
    )
    print(f"Status: {create_tag_response.status_code}")
    if create_tag_response.status_code == 200:
        created_tag = create_tag_response.json()
        print(f"Created tag: {created_tag['name']} ({created_tag['id']})")
        tag_id = created_tag['id']
    else:
        print(f"Error creating tag: {create_tag_response.text}")
        tag_id = None
    
    # Test document operations if we have a sample document
    sample_file = "test_document.txt"
    
    # Create a test document if it doesn't exist
    if not os.path.exists(sample_file):
        with open(sample_file, "w") as f:
            f.write("This is a test document for the AI Document Search API.\n")
            f.write("It contains some sample text that can be processed.\n")
            f.write("The text can be used for testing search, summary, and other features.\n")
            f.write("This is a multi-paragraph document with some structure.\n\n")
            f.write("This is the second paragraph with different content.\n")
            f.write("It discusses business strategy and financial analysis.\n")
            f.write("The document also mentions implementation plans and resource allocation.\n")
    
    if os.path.exists(sample_file):
        print(f"\nUploading test document {sample_file}...")
        with open(sample_file, "rb") as f:
            upload_response = requests.post(
                f"{BASE_URL}/upload",
                headers=headers,
                files={"file": f},
                data={"title": "Test Document"}
            )
        
        print(f"Upload status: {upload_response.status_code}")
        if upload_response.status_code == 200:
            document = upload_response.json()
            document_id = document['id']
            print(f"Uploaded document: {document['title']} ({document_id})")
            
            # Test adding tags to document
            if tag_id:
                print(f"\nAdding tag {tag_id} to document {document_id}...")
                add_tag_response = requests.post(
                    f"{BASE_URL}/documents/{document_id}/tags",
                    headers=headers,
                    json=[tag_id]
                )
                print(f"Status: {add_tag_response.status_code}")
                if add_tag_response.status_code == 200:
                    print("Tag added successfully")
            
            # Test getting document tags
            print(f"\nGetting tags for document {document_id}...")
            doc_tags_response = requests.get(
                f"{BASE_URL}/documents/{document_id}/tags",
                headers=headers
            )
            print(f"Status: {doc_tags_response.status_code}")
            if doc_tags_response.status_code == 200:
                doc_tags = doc_tags_response.json()
                print(f"Document has {len(doc_tags)} tags")
                for tag in doc_tags:
                    print(f"  - {tag['name']} ({tag['id']})")
            
            # Test searching
            print("\nTesting document search...")
            search_response = requests.post(
                f"{BASE_URL}/search",
                headers=headers,
                json={"query": "business strategy", "limit": 5}
            )
            print(f"Search status: {search_response.status_code}")
            if search_response.status_code == 200:
                results = search_response.json()
                print(f"Found {len(results)} results")
                for result in results:
                    print(f"  - {result['title']} (Score: {result['similarity_score']:.2f})")
                    print(f"    Snippet: {result['snippet']}")
            
            # Test document summary
            print(f"\nGetting summary for document {document_id}...")
            summary_response = requests.get(
                f"{BASE_URL}/documents/{document_id}/summary",
                headers=headers,
                params={"summary_type": "general", "max_tokens": 500}
            )
            print(f"Summary status: {summary_response.status_code}")
            if summary_response.status_code == 200:
                summary = summary_response.json()
                print(f"Summary for {summary['title']}:")
                print(summary['summary'])
            
            # Test document insights
            print(f"\nGetting insights for document {document_id}...")
            insights_response = requests.get(
                f"{BASE_URL}/documents/{document_id}/insights",
                headers=headers
            )
            print(f"Insights status: {insights_response.status_code}")
            if insights_response.status_code == 200:
                insights = insights_response.json()
                print(f"Insights for {insights['title']}:")
                print(f"Sentiment: {insights['sentiment_analysis']['overall_sentiment']} (Confidence: {insights['sentiment_analysis']['confidence']:.2f})")
                print("Top topics:")
                for topic in insights['topic_modeling']['main_topics'][:3]:
                    print(f"  - {topic['name']} (Relevance: {topic['relevance']:.2f})")
            
            # Test asking a question about the document
            print(f"\nAsking a question about document {document_id}...")
            question_response = requests.post(
                f"{BASE_URL}/documents/{document_id}/ask",
                headers=headers,
                json={"question": "What is the main topic of this document?"}
            )
            print(f"Question status: {question_response.status_code}")
            if question_response.status_code == 200:
                answer = question_response.json()
                print(f"Question: {answer['question']}")
                print(f"Answer: {answer['answer']}")
            
            # Test getting related documents
            print(f"\nGetting related documents for {document_id}...")
            related_response = requests.get(
                f"{BASE_URL}/documents/{document_id}/related",
                headers=headers
            )
            print(f"Related docs status: {related_response.status_code}")
            if related_response.status_code == 200:
                related = related_response.json()
                print(f"Found {len(related)} related documents")
                for doc in related:
                    print(f"  - {doc['title']} (Score: {doc['relatedness_score']:.2f})")
        else:
            print(f"Error uploading document: {upload_response.text}")
    else:
        print(f"Could not find or create test document {sample_file}")
    
    print("\nAPI test completed")

if __name__ == "__main__":
    test_api() 