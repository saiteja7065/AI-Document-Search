#!/usr/bin/env python3
"""
Test script for AI Document Search Admin API

This script tests the admin functionality of the backend API.
"""

import requests
import json
import os
import time

# API configuration
BASE_URL = "http://localhost:8000"

def test_admin_api():
    print("Testing AI Document Search Admin API...")
    
    # Get API status
    response = requests.get(f"{BASE_URL}/")
    print(f"API Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Get authentication token for admin
    print("\nGetting admin authentication token...")
    auth_response = requests.post(
        f"{BASE_URL}/token",
        data={"username": "admin", "password": "password"}
    )
    
    if auth_response.status_code != 200:
        print(f"Error getting token: {auth_response.status_code}")
        print(f"Response: {auth_response.text}")
        return
    
    token = auth_response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {token}"}
    print(f"Admin token obtained: {token[:20]}...")
    
    # Test getting admin stats
    print("\nTesting GET /admin/stats...")
    stats_response = requests.get(f"{BASE_URL}/admin/stats", headers=admin_headers)
    print(f"Status: {stats_response.status_code}")
    if stats_response.status_code == 200:
        stats = stats_response.json()
        print(f"Total documents: {stats.get('total_documents', 'N/A')}")
        print(f"System status: {stats.get('system_status', 'N/A')}")
        print(f"API Version: {stats.get('api_version', 'N/A')}")
        
        # Document types
        print("\nDocument types:")
        for doc_type in stats.get('documents_by_type', []):
            print(f"  - {doc_type.get('type', 'unknown')}: {doc_type.get('count', 0)}")
        
        # User stats
        print("\nUser document counts:")
        for user in stats.get('documents_by_user', []):
            print(f"  - {user.get('user_id', 'unknown')}: {user.get('document_count', 0)}")
    else:
        print(f"Error getting stats: {stats_response.text}")
    
    # Test getting admin users
    print("\nTesting GET /admin/users...")
    users_response = requests.get(f"{BASE_URL}/admin/users", headers=admin_headers)
    print(f"Status: {users_response.status_code}")
    if users_response.status_code == 200:
        users = users_response.json()
        print(f"Found {len(users)} users")
        for user in users:
            print(f"  - {user.get('username')} ({user.get('id')}): {'Admin' if user.get('is_admin') else 'User'}")
    else:
        print(f"Error getting users: {users_response.text}")
    
    # Test getting admin documents
    print("\nTesting GET /admin/documents...")
    docs_response = requests.get(f"{BASE_URL}/admin/documents", headers=admin_headers)
    print(f"Status: {docs_response.status_code}")
    if docs_response.status_code == 200:
        docs = docs_response.json()
        print(f"Found {len(docs)} documents")
        
        # Test admin document deletion if there are documents
        if len(docs) > 0:
            doc_id = docs[0].get('id')
            print(f"\nTesting DELETE /admin/documents/{doc_id}...")
            
            # Don't actually delete, just check if the endpoint is working
            print("Skipping actual deletion for test purposes.")
            delete_response = requests.get(f"{BASE_URL}/documents/{doc_id}", headers=admin_headers)
            print(f"Document exists check: {delete_response.status_code}")
            
            if delete_response.status_code == 200:
                print("Document exists and could be deleted if needed.")
            else:
                print(f"Error checking document: {delete_response.text}")
    else:
        print(f"Error getting documents: {docs_response.text}")
    
    # Test with non-admin user
    print("\nTesting with non-admin user...")
    non_admin_response = requests.post(
        f"{BASE_URL}/token",
        data={"username": "regular_user", "password": "password"}
    )
    
    if non_admin_response.status_code == 200:
        non_admin_token = non_admin_response.json()["access_token"]
        non_admin_headers = {"Authorization": f"Bearer {non_admin_token}"}
        print(f"Non-admin token obtained")
        
        # Try to access admin endpoint
        admin_access_response = requests.get(
            f"{BASE_URL}/admin/stats", 
            headers=non_admin_headers
        )
        
        if admin_access_response.status_code == 403:
            print("Success: Non-admin user correctly denied access to admin endpoint")
        else:
            print(f"Warning: Non-admin user got status {admin_access_response.status_code} when accessing admin endpoint")
            print(f"Response: {admin_access_response.text}")
    else:
        print("Skipping non-admin test as token could not be obtained")
    
    print("\nAdmin API test completed")

if __name__ == "__main__":
    test_admin_api() 