// Mock API service for document search and related operations
import { getAllDocuments, getUserDocuments, getDocumentById, deleteDocument as storageDeleteDocument, getAllTags, createTag as storageCreateTag, addTagsToDocument, removeTagFromDocument, getDocumentTags, getDocumentsByTag } from './storageService';

// Mock processing delay
const simulateProcessingDelay = async (minMs = 500, maxMs = 1500) => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
};

// Re-export deleteDocument function from storageService
export const deleteDocument = async (documentId) => {
  await simulateProcessingDelay(800, 1500);
  return storageDeleteDocument(documentId);
};

/**
 * Get documents for admin
 * @returns {Promise<Array>} - List of all documents with user info
 */
export const getAdminDocuments = async () => {
  await simulateProcessingDelay(800, 1500);
  
  // Get all documents
  const documents = await getAllDocuments();
  
  // Enhance with mock user information
  return documents.map(doc => ({
    ...doc,
    userName: doc.uploadedBy === 'user-123' ? 'Demo User' : 'Unknown User',
    userEmail: doc.uploadedBy === 'user-123' ? 'demo@example.com' : 'unknown@example.com'
  }));
};

/**
 * Get system stats for admin dashboard
 * @returns {Promise<Object>} - System statistics
 */
export const getStats = async () => {
  await simulateProcessingDelay(500, 1200);
  
  const documents = await getAllDocuments();
  
  return {
    totalDocuments: documents.length,
    totalUsers: 1, // Mock single user for demo
    totalStorage: documents.reduce((total, doc) => total + (doc.fileSize || 0), 0) / (1024 * 1024), // in MB
    documentTypes: {
      pdf: documents.filter(doc => doc.fileType === 'pdf').length,
      docx: documents.filter(doc => doc.fileType === 'docx').length,
      txt: documents.filter(doc => doc.fileType === 'txt').length,
      other: documents.filter(doc => !['pdf', 'docx', 'txt'].includes(doc.fileType)).length
    },
    recentActivity: [
      { type: 'upload', userId: 'user-123', documentId: documents[0]?.id, timestamp: new Date().toISOString() },
      { type: 'search', userId: 'user-123', query: 'project proposal', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { type: 'download', userId: 'user-123', documentId: documents[1]?.id, timestamp: new Date(Date.now() - 7200000).toISOString() }
    ]
  };
};

/**
 * Search documents based on query
 * @param {string} query - The search query
 * @param {Object} options - Search options 
 * @returns {Promise<Array>} - List of matching documents with relevance scores
 */
export const searchDocuments = async (query, options = {}) => {
  const { userId, limit = 10, filters = {} } = options;
  
  await simulateProcessingDelay(800, 2000); // Simulate search processing
  
  // Get documents (all or user-specific)
  const documents = userId 
    ? await getUserDocuments(userId)
    : await getAllDocuments();
  
  if (!query || !query.trim()) {
    return documents.slice(0, limit);
  }
  
  // Simple search algorithm: check if query appears in title or description
  // In a real app, this would use vector embeddings and semantic search
  const results = documents
    .map(doc => {
      // Calculate a mock similarity score
      const titleMatch = (doc.title || '').toLowerCase().includes(query.toLowerCase());
      const descMatch = (doc.description || '').toLowerCase().includes(query.toLowerCase());
      
      let similarityScore = 0;
      if (titleMatch) similarityScore += 0.6;
      if (descMatch) similarityScore += 0.4;
      
      // Add some randomness for variety
      similarityScore = Math.min(0.99, similarityScore + Math.random() * 0.3);
      
      // Create a snippet with highlighted match
      let snippet = doc.description || '';
      if (snippet && query.length > 0) {
        const lowerSnippet = snippet.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const matchIndex = lowerSnippet.indexOf(lowerQuery);
        
        if (matchIndex >= 0) {
          // Extract context around the match
          const start = Math.max(0, matchIndex - 40);
          const end = Math.min(snippet.length, matchIndex + query.length + 40);
          snippet = (start > 0 ? '...' : '') + 
                    snippet.slice(start, end) + 
                    (end < snippet.length ? '...' : '');
        }
      }
      
      return {
        document_id: doc.id,
        title: doc.title,
        file_type: doc.fileType,
        similarity_score: similarityScore,
        snippet: snippet || 'No preview available',
        uploaded_at: doc.uploadedAt,
        file_url: doc.fileUrl
      };
    })
    .filter(result => result.similarity_score > 0)
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, limit);
  
  return results;
};

/**
 * Get a document by ID
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - Document object
 */
export const getDocument = async (documentId) => {
  await simulateProcessingDelay(300, 800);
  return getDocumentById(documentId);
};

/**
 * Generate a summary of a document
 * @param {string} documentId - The document ID
 * @param {string} summaryType - Type of summary (general, key_points, detailed)
 * @param {number} maxLength - Maximum summary length
 * @returns {Promise<Object>} - Summary object
 */
export const getDocumentSummary = async (documentId, summaryType = 'general', maxLength = 500) => {
  // Longer processing time for summaries
  await simulateProcessingDelay(1500, 3000);
  
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Generate different mock summaries based on type
  let summary = '';
  const title = document.title;
  const fileType = document.fileType;
  
  switch (summaryType) {
    case 'key_points':
      summary = `Key points from "${title}":\n\n` +
                `• This ${fileType.toUpperCase()} document focuses on important business information.\n` +
                `• It contains critical data that can be used for decision making.\n` +
                `• The document was uploaded on ${new Date(document.uploadedAt).toLocaleDateString()}.\n` +
                `• Several sections discuss strategies and implementation details.\n` +
                `• Contains references to related documents and resources.`;
      break;
    
    case 'detailed':
      summary = `Detailed Summary of "${title}"\n\n` +
                `This ${fileType.toUpperCase()} document (${(document.fileSize / (1024 * 1024)).toFixed(2)} MB) provides comprehensive information about the subject matter. ` +
                `The document begins with an introduction to the topic, followed by several sections that delve into specific aspects.\n\n` +
                `The first section outlines the background and context, establishing the foundation for understanding the subsequent content. ` +
                `Following this, the document presents detailed analysis of various factors and considerations relevant to the topic.\n\n` +
                `Notably, the document includes statistical data, charts, and references to external sources that support its claims and findings. ` +
                `The conclusion summarizes the key takeaways and suggests potential next steps or areas for further exploration.\n\n` +
                `This document would be particularly useful for stakeholders involved in decision-making processes related to the subject matter.`;
      break;
    
    default: // general
      summary = `Summary of "${title}"\n\n` +
                `This ${fileType.toUpperCase()} document provides information about ${title.toLowerCase().includes('report') ? 'reporting and analysis' : 'the specified topic'}. ` +
                `It contains approximately ${Math.round(document.fileSize / 1000)} KB of data uploaded on ${new Date(document.uploadedAt).toLocaleDateString()}. ` +
                `The document covers several important aspects related to the subject matter and presents information in a structured format. ` +
                `It would be beneficial to review the complete document for comprehensive understanding.`;
  }
  
  // Limit summary length if needed
  if (maxLength > 0 && summary.length > maxLength) {
    summary = summary.substring(0, maxLength) + '...';
  }
  
  return {
    document_id: documentId,
    title: document.title,
    summary_type: summaryType,
    summary,
    generated_at: new Date().toISOString()
  };
};

/**
 * Ask a question about a document (RAG implementation)
 * @param {string} documentId - The document ID
 * @param {string} question - User question
 * @returns {Promise<Object>} - Answer object
 */
export const askDocumentQuestion = async (documentId, question) => {
  // Simulate RAG processing time
  await simulateProcessingDelay(2000, 4000);
  
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Mock answers based on question types
  let answer = '';
  
  if (question.toLowerCase().includes('about') || question.toLowerCase().includes('what is')) {
    answer = `This document titled "${document.title}" is a ${document.fileType.toUpperCase()} file that contains information about ${document.title.split(':')[0]}. It was uploaded on ${new Date(document.uploadedAt).toLocaleDateString()} and is approximately ${(document.fileSize / (1024 * 1024)).toFixed(2)} MB in size.`;
  } else if (question.toLowerCase().includes('when') || question.toLowerCase().includes('date')) {
    answer = `The document was uploaded on ${new Date(document.uploadedAt).toLocaleDateString()}.`;
  } else if (question.toLowerCase().includes('who') || question.toLowerCase().includes('author')) {
    answer = `The document was uploaded by a user with ID ${document.uploadedBy}. No specific author information is available in the metadata.`;
  } else if (question.toLowerCase().includes('how') || question.toLowerCase().includes('process')) {
    answer = `The document explains several processes related to ${document.title}. It outlines steps for implementation and provides guidelines for best practices.`;
  } else {
    answer = `Based on the document "${document.title}", I can tell you that it contains information relevant to your question. The document discusses various aspects related to ${document.title.split(':')[0]} and provides detailed insights on the matter.`;
  }
  
  return {
    document_id: documentId,
    question,
    answer,
    confidence: 0.85 + (Math.random() * 0.1),
    generated_at: new Date().toISOString()
  };
};

/**
 * Get related documents
 * @param {string} documentId - The document ID to find related docs for
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - List of related documents
 */
export const getRelatedDocuments = async (documentId, limit = 3) => {
  await simulateProcessingDelay(800, 1500);
  
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Get all documents
  const allDocuments = await getAllDocuments();
  
  // Filter out the current document
  const otherDocuments = allDocuments.filter(doc => doc.id !== documentId);
  
  // Calculate relatedness score (mock implementation)
  const relatedDocs = otherDocuments.map(doc => {
    // Simple mock algorithm - match words in titles
    const words1 = document.title.toLowerCase().split(/\W+/);
    const words2 = doc.title.toLowerCase().split(/\W+/);
    
    // Count matching words
    const matchingWords = words1.filter(word => words2.includes(word) && word.length > 3);
    
    // Calculate score based on matching words and file type
    let score = matchingWords.length * 0.15;
    
    // Same file type bonus
    if (doc.fileType === document.fileType) {
      score += 0.2;
    }
    
    // Add randomness for variety
    score = Math.min(0.95, score + Math.random() * 0.4);
    
    return {
      ...doc,
      relatedness_score: score
    };
  });
  
  // Sort by relatedness and limit results
  return relatedDocs
    .filter(doc => doc.relatedness_score > 0.3) // Only include somewhat related docs
    .sort((a, b) => b.relatedness_score - a.relatedness_score)
    .slice(0, limit);
};

/**
 * Get user activity (for dashboard)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User activity data
 */
export const getUserActivity = async (userId) => {
  await simulateProcessingDelay(500, 1000);
  
  // Mock user activity data
  return {
    recent_searches: [
      { query: "project proposal", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), results: 4 },
      { query: "financial report", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), results: 2 },
      { query: "meeting notes", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), results: 5 }
    ],
    recent_uploads: await getUserDocuments(userId).then(docs => 
      docs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, 5)
    ),
    stats: {
      total_documents: (await getUserDocuments(userId)).length,
      total_searches: 12,
      total_storage_used: (await getUserDocuments(userId))
        .reduce((total, doc) => total + (doc.fileSize || 0), 0) / (1024 * 1024), // in MB
      documents_by_type: {
        pdf: (await getUserDocuments(userId)).filter(doc => doc.fileType === 'pdf').length,
        docx: (await getUserDocuments(userId)).filter(doc => doc.fileType === 'docx').length,
        txt: (await getUserDocuments(userId)).filter(doc => doc.fileType === 'txt').length
      }
    }
  };
};

// Re-export tag-related functions
export const getTags = async () => {
  await simulateProcessingDelay(400, 800);
  return getAllTags();
};

export const createTag = async (name, color) => {
  await simulateProcessingDelay(500, 1000);
  return storageCreateTag(name, color);
};

export const getDocumentTagsByDocId = async (documentId) => {
  await simulateProcessingDelay(300, 700);
  return getDocumentTags(documentId);
};

export const addTagsToDoc = async (documentId, tagIds) => {
  await simulateProcessingDelay(500, 1000);
  return addTagsToDocument(documentId, tagIds);
};

export const removeTagFromDoc = async (documentId, tagId) => {
  await simulateProcessingDelay(300, 800);
  return removeTagFromDocument(documentId, tagId);
};

export const searchDocumentsByTag = async (tagId) => {
  await simulateProcessingDelay(700, 1500);
  return getDocumentsByTag(tagId);
};

/**
 * Enhanced document summary with different approaches
 * @param {string} documentId - The document ID
 * @param {Object} options - Summary options
 * @returns {Promise<Object>} - Enhanced summary result
 */
export const getEnhancedDocumentSummary = async (documentId, options = {}) => {
  const {
    summaryType = 'comprehensive',
    includeKeyPoints = true,
    includeTags = true,
    includeEntities = true,
    maxLength = 1000
  } = options;
  
  // Longer processing time for enhanced summaries
  await simulateProcessingDelay(2000, 5000);
  
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Get document tags if requested
  let tags = [];
  if (includeTags) {
    tags = await getDocumentTags(documentId);
  }
  
  // Generate base summary
  let summary = await getDocumentSummary(documentId, 'detailed');
  
  // Create enhanced response
  const result = {
    document_id: documentId,
    title: document.title,
    summary_type: summaryType,
    summary: summary.summary,
    generated_at: new Date().toISOString()
  };
  
  // Add key points if requested
  if (includeKeyPoints) {
    result.key_points = [
      "The document discusses important information related to " + document.title,
      "Several methodologies and approaches are outlined in detail",
      "Data analysis reveals significant patterns worth further investigation",
      "Recommendations focus on practical implementation steps",
      "Multiple stakeholders are identified with specific action items"
    ];
  }
  
  // Add tags if requested and available
  if (includeTags && tags.length > 0) {
    result.tags = tags;
  }
  
  // Add named entities if requested
  if (includeEntities) {
    result.named_entities = {
      organizations: ["Company XYZ", "Department A", "Team Alpha"],
      people: ["John Smith", "Mary Johnson", "Technical Lead"],
      locations: ["Headquarters", "Branch Office", "Meeting Room 3"],
      dates: ["Q3 2023", "March 15th", "Next fiscal year"],
      products: ["Product Z", "System X", "Framework Y"]
    };
  }
  
  // Add document metadata
  result.metadata = {
    file_type: document.fileType,
    file_size: document.fileSize,
    uploaded_at: document.uploadedAt,
    last_modified: document.updatedAt || document.uploadedAt
  };
  
  return result;
};

/**
 * Extract document insights
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - Extracted insights
 */
export const getDocumentInsights = async (documentId) => {
  await simulateProcessingDelay(3000, 6000);
  
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Get document tags
  const tags = await getDocumentTags(documentId);
  
  return {
    document_id: documentId,
    title: document.title,
    sentiment_analysis: {
      overall_sentiment: "positive",
      confidence: 0.87,
      sentiment_breakdown: {
        positive: 0.72,
        neutral: 0.25,
        negative: 0.03
      }
    },
    topic_modeling: {
      main_topics: [
        { name: "Business Strategy", relevance: 0.85 },
        { name: "Financial Analysis", relevance: 0.65 },
        { name: "Market Research", relevance: 0.58 },
        { name: "Technology Implementation", relevance: 0.42 }
      ],
      topic_distribution: {
        "Strategic Planning": 32,
        "Resource Allocation": 28,
        "Performance Metrics": 24,
        "Risk Assessment": 16
      }
    },
    readability: {
      score: 65,
      grade_level: "College",
      reading_time: Math.floor(document.fileSize / 3000) + " minutes",
      complexity: "Moderate"
    },
    keywords: [
      { word: "strategy", frequency: 14, relevance: 0.92 },
      { word: "implementation", frequency: 9, relevance: 0.85 },
      { word: "analysis", frequency: 8, relevance: 0.83 },
      { word: "performance", frequency: 7, relevance: 0.78 },
      { word: "resources", frequency: 6, relevance: 0.72 }
    ],
    tags: tags,
    generated_at: new Date().toISOString()
  };
};

export default {
  searchDocuments,
  getDocument,
  getDocumentSummary,
  askDocumentQuestion,
  getRelatedDocuments,
  getUserActivity,
  deleteDocument,
  getAdminDocuments,
  getStats,
  getTags,
  createTag,
  getDocumentTagsByDocId,
  addTagsToDoc,
  removeTagFromDoc,
  searchDocumentsByTag,
  getEnhancedDocumentSummary,
  getDocumentInsights
}; 