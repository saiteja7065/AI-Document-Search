// Real API service for document search and related operations
import axios from 'axios';
import { addTagsToDocument, removeTagFromDocument, getDocumentTags, createTag as storageCreateTag, getAllTags } from './storageService';

// Get API configuration from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';
const BASE_URL = `${API_URL}`;

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Removed the interceptor that adds the auth token to requests
api.interceptors.request.use(null, (error) => Promise.reject(error));

// Fallback to mock implementation if backend request fails
const withFallback = async (apiCall, mockFunction, ...args) => {
  try {
    return await apiCall();
  } catch (error) {
    console.warn('API call failed, using mock data:', error);
    return mockFunction(...args);
  }
};

/**
 * Delete a document
 * @param {string} documentId - Document ID to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteDocument = async (documentId) => {
  try {
    await api.delete(`/documents/${documentId}`);
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
};

/**
 * Get documents for admin
 * @returns {Promise<Array>} - List of all documents with user info
 */
export const getAdminDocuments = async () => {
  try {
    const response = await api.get('/admin/documents');
    return response.data;
  } catch (error) {
    console.error('Error getting admin documents:', error);
    throw error;
  }
};

/**
 * Get system stats for admin dashboard
 * @returns {Promise<Object>} - System statistics
 */
export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error getting admin stats:', error);
    throw error;
  }
};

/**
 * Get users for admin
 * @returns {Promise<Array>} - List of users
 */
export const getAdminUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error getting admin users:', error);
    throw error;
  }
};

/**
 * Delete document as admin
 * @param {string} documentId - Document ID to delete
 * @returns {Promise<Object>} - Response
 */
export const adminDeleteDocument = async (documentId) => {
  try {
    const response = await api.delete(`/admin/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting document as admin:', error);
    throw error;
  }
};

/**
 * Search documents based on query
 * @param {string} query - The search query
 * @param {Object} options - Search options 
 * @returns {Promise<Array>} - List of matching documents with relevance scores
 */
export const searchDocuments = async (query, options = {}) => {
  const { limit = 10 } = options;
  
  try {
    const response = await api.post('/search', { 
      query, 
      limit 
    });
    return response.data;
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};

/**
 * Get a document by ID
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - Document object
 */
export const getDocument = async (documentId) => {
  try {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

/**
 * Generate a summary of a document
 * @param {string} documentId - The document ID
 * @param {string} summaryType - Type of summary (general, key_points, detailed)
 * @param {number} maxLength - Maximum summary length
 * @returns {Promise<Object>} - Summary object
 */
export const getDocumentSummary = async (documentId, summaryType = 'general', maxLength = 500) => {
  try {
    const response = await api.get(`/documents/${documentId}/summary`, {
      params: {
        summary_type: summaryType,
        max_tokens: maxLength
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting document summary:', error);
    throw error;
  }
};

/**
 * Ask a question about a document
 * @param {string} documentId - The document ID
 * @param {string} question - The question to ask
 * @returns {Promise<Object>} - Answer object
 */
export const askDocumentQuestion = async (documentId, question) => {
  try {
    const response = await api.post(`/documents/${documentId}/ask`, {
      question
    });
    return response.data;
  } catch (error) {
    console.error('Error asking document question:', error);
    throw error;
  }
};

/**
 * Get related documents
 * @param {string} documentId - The document ID
 * @param {number} limit - Maximum number of related documents
 * @returns {Promise<Array>} - List of related documents
 */
export const getRelatedDocuments = async (documentId, limit = 3) => {
  try {
    const response = await api.get(`/documents/${documentId}/related`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting related documents:', error);
    throw error;
  }
};

/**
 * Get user activity
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - List of user activities
 */
export const getUserActivity = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/activity`);
    return response.data;
  } catch (error) {
    console.error('Error getting user activity:', error);
    throw error;
  }
};

/**
 * Upload a document
 * @param {File} file - The file to upload
 * @param {string} title - Document title
 * @param {Function} progressCallback - Callback for upload progress
 * @returns {Promise<Object>} - Uploaded document metadata
 */
export const uploadDocument = async (file, title, progressCallback = () => {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        progressCallback(percentCompleted);
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// The following functions still use the mock implementation
// They will be updated in the future when backend endpoints are available

/**
 * Get all available tags
 * @returns {Promise<Array>} - List of tags
 */
export const getTags = async () => {
  return getAllTags();
};

/**
 * Create a new tag
 * @param {string} name - Tag name
 * @param {string} color - Tag color
 * @returns {Promise<Object>} - Created tag
 */
export const createTag = async (name, color) => {
  return storageCreateTag(name, color);
};

/**
 * Get tags for a specific document
 * @param {string} documentId - Document ID
 * @returns {Promise<Array>} - List of tags for the document
 */
export const getDocumentTagsByDocId = async (documentId) => {
  return getDocumentTags(documentId);
};

/**
 * Add tags to a document
 * @param {string} documentId - Document ID
 * @param {Array} tagIds - List of tag IDs
 * @returns {Promise<boolean>} - Success status
 */
export const addTagsToDoc = async (documentId, tagIds) => {
  return addTagsToDocument(documentId, tagIds);
};

/**
 * Remove a tag from a document
 * @param {string} documentId - Document ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<boolean>} - Success status
 */
export const removeTagFromDoc = async (documentId, tagId) => {
  return removeTagFromDocument(documentId, tagId);
};

/**
 * Search documents by tag
 * @param {string} tagId - Tag ID
 * @returns {Promise<Array>} - List of documents with the tag
 */
export const searchDocumentsByTag = async (tagId) => {
  try {
    const response = await api.get(`/tags/${tagId}/documents`);
    return response.data;
  } catch (error) {
    console.error('Error searching documents by tag:', error);
    throw error;
  }
};

/**
 * Enhanced document summary with different approaches
 * @param {string} documentId - The document ID
 * @param {Object} options - Summary options
 * @returns {Promise<Object>} - Enhanced summary result
 */
export const getEnhancedDocumentSummary = async (documentId, options = {}) => {
  try {
    const response = await api.get(`/documents/${documentId}/enhanced-summary`, {
      params: options
    });
    return response.data;
  } catch (error) {
    console.error('Error getting enhanced document summary:', error);
    throw error;
  }
};

/**
 * Get document insights
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - Document insights
 */
export const getDocumentInsights = async (documentId) => {
  try {
    const response = await api.get(`/documents/${documentId}/insights`);
    return response.data;
  } catch (error) {
    console.error('Error getting document insights:', error);
    throw error;
  }
};

/**
 * Generate key points for a document
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - Key points object
 */
export const generateKeyPoints = async (documentId) => {
  try {
    const response = await api.post(`/documents/${documentId}/key-points`);
    return response.data;
  } catch (error) {
    console.error('Error generating key points:', error);
    throw error;
  }
};

/**
 * Generate slides for a document
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - Slides object
 */
export const generateSlides = async (documentId) => {
  try {
    const response = await api.post(`/documents/${documentId}/generate-slides`);
    return response.data;
  } catch (error) {
    console.error('Error generating slides:', error);
    throw error;
  }
};

/**
 * Generate an image based on document content
 * @param {string} documentId - The document ID
 * @param {string} description - Image description
 * @returns {Promise<Object>} - Generated image URL
 */
export const generateImage = async (documentId, description) => {
  try {
    const response = await api.post(`/documents/${documentId}/generate-image`, {
      description
    });
    return response.data;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

/**
 * Get voice narration for a document
 * @param {string} documentId - The document ID
 * @returns {Promise<Blob>} - Audio file blob
 */
export const getVoiceNarration = async (documentId) => {
  try {
    const response = await api.post(`/documents/${documentId}/voice`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error getting voice narration:', error);
    throw error;
  }
};

// Export default object with all API functions
export default {
  searchDocuments,
  getDocument,
  getDocumentSummary,
  askDocumentQuestion,
  getRelatedDocuments,
  getUserActivity,
  deleteDocument,
  getAdminDocuments,
  getAdminStats,
  getAdminUsers,
  adminDeleteDocument,
  getTags,
  createTag,
  getDocumentTagsByDocId,
  addTagsToDoc,
  removeTagFromDoc,
  searchDocumentsByTag,
  getEnhancedDocumentSummary,
  getDocumentInsights,
  uploadDocument,
  generateKeyPoints,
  generateSlides,
  generateImage,
  getVoiceNarration
};