// Mock implementation for document storage
import { v4 as uuidv4 } from 'uuid';

// Mock storage for testing without Firebase
const mockStorage = {
  documents: [],
  documentCounter: 0,
  users: {
    'user-123': { name: 'Demo User', email: 'demo@example.com' }
  },
  bookmarks: [],
  tags: [
    { id: 'tag-1', name: 'Important', color: '#f44336' },
    { id: 'tag-2', name: 'Work', color: '#2196f3' },
    { id: 'tag-3', name: 'Personal', color: '#4caf50' },
    { id: 'tag-4', name: 'Archived', color: '#9e9e9e' },
    { id: 'tag-5', name: 'Confidential', color: '#ff9800' }
  ],
  documentTags: [] // Relationship between documents and tags
};

/**
 * Upload a document to storage
 * @param {File} file - The file to upload
 * @param {string} title - Document title
 * @param {string} userId - User ID who is uploading
 * @param {Function} progressCallback - Callback for upload progress
 * @returns {Promise<Object>} - Uploaded document metadata
 */
export const uploadDocument = async (file, title, userId, progressCallback = () => {}) => {
  return new Promise((resolve) => {
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      progressCallback(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        // Create mock document
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const docId = `doc-${uuidv4()}`;
        const newDoc = {
          id: docId,
          title,
          fileName: file.name,
          fileSize: file.size,
          fileType: fileExtension,
          fileUrl: URL.createObjectURL(file), // Create a blob URL for the file
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          path: `documents/${userId}/${docId}.${fileExtension}`,
          description: `This is a ${fileExtension.toUpperCase()} document uploaded by the user.`
        };
        
        mockStorage.documents.push(newDoc);
        resolve(newDoc);
      }
    }, 300);
  });
};

/**
 * Get all documents for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - List of documents
 */
export const getUserDocuments = async (userId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockStorage.documents.filter(doc => doc.uploadedBy === userId);
};

/**
 * Delete a document
 * @param {string} documentId - Document ID to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteDocument = async (documentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find and remove the document
  const docIndex = mockStorage.documents.findIndex(doc => doc.id === documentId);
  
  if (docIndex !== -1) {
    mockStorage.documents.splice(docIndex, 1);
    
    // Also remove from bookmarks
    mockStorage.bookmarks = mockStorage.bookmarks.filter(
      bookmark => bookmark.documentId !== documentId
    );
    
    return true;
  }
  
  return false;
};

/**
 * Update document metadata
 * @param {string} documentId - Document ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated document
 */
export const updateDocumentMetadata = async (documentId, updates) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const docIndex = mockStorage.documents.findIndex(doc => doc.id === documentId);
  
  if (docIndex !== -1) {
    // Update the document
    mockStorage.documents[docIndex] = {
      ...mockStorage.documents[docIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return mockStorage.documents[docIndex];
  }
  
  throw new Error('Document not found');
};

/**
 * Get all documents (Admin only)
 * @returns {Promise<Array>} - List of all documents
 */
export const getAllDocuments = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [...mockStorage.documents].sort((a, b) => 
    new Date(b.uploadedAt) - new Date(a.uploadedAt)
  );
};

/**
 * Get a document by ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Document object
 */
export const getDocumentById = async (documentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const document = mockStorage.documents.find(doc => doc.id === documentId);
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  return document;
};

/**
 * Bookmark a document
 * @param {string} userId - User ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - Bookmark object
 */
export const bookmarkDocument = async (userId, documentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if already bookmarked
  const existingBookmark = mockStorage.bookmarks.find(
    b => b.userId === userId && b.documentId === documentId
  );
  
  if (existingBookmark) {
    return existingBookmark;
  }
  
  // Create new bookmark
  const bookmark = {
    id: `bookmark-${uuidv4()}`,
    userId,
    documentId,
    createdAt: new Date().toISOString()
  };
  
  mockStorage.bookmarks.push(bookmark);
  return bookmark;
};

/**
 * Remove a document bookmark
 * @param {string} userId - User ID
 * @param {string} documentId - Document ID
 * @returns {Promise<boolean>} - Success status
 */
export const removeBookmark = async (userId, documentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const bookmarkIndex = mockStorage.bookmarks.findIndex(
    b => b.userId === userId && b.documentId === documentId
  );
  
  if (bookmarkIndex !== -1) {
    mockStorage.bookmarks.splice(bookmarkIndex, 1);
    return true;
  }
  
  return false;
};

/**
 * Get bookmarked documents for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - List of bookmarked documents
 */
export const getBookmarkedDocuments = async (userId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get bookmark entries for this user
  const bookmarks = mockStorage.bookmarks.filter(b => b.userId === userId);
  
  // Get the actual documents
  const bookmarkedDocs = bookmarks.map(bookmark => {
    const doc = mockStorage.documents.find(d => d.id === bookmark.documentId);
    return doc ? { ...doc, bookmarkedAt: bookmark.createdAt } : null;
  }).filter(doc => doc !== null);
  
  return bookmarkedDocs;
};

/**
 * Check if a document is bookmarked
 * @param {string} userId - User ID
 * @param {string} documentId - Document ID
 * @returns {Promise<boolean>} - Whether the document is bookmarked
 */
export const isDocumentBookmarked = async (userId, documentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockStorage.bookmarks.some(
    b => b.userId === userId && b.documentId === documentId
  );
};

/**
 * Get all available tags
 * @returns {Promise<Array>} - List of all tags
 */
export const getAllTags = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...mockStorage.tags];
};

/**
 * Create a new tag
 * @param {string} name - Tag name
 * @param {string} color - Tag color (hex)
 * @returns {Promise<Object>} - Created tag
 */
export const createTag = async (name, color = '#2196f3') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Check if tag with this name already exists
  if (mockStorage.tags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
    throw new Error(`Tag "${name}" already exists`);
  }
  
  const newTag = {
    id: `tag-${uuidv4()}`,
    name,
    color,
    createdAt: new Date().toISOString()
  };
  
  mockStorage.tags.push(newTag);
  return newTag;
};

/**
 * Add tags to a document
 * @param {string} documentId - Document ID
 * @param {Array<string>} tagIds - Array of tag IDs
 * @returns {Promise<Array>} - Updated document tags
 */
export const addTagsToDocument = async (documentId, tagIds) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Check if document exists
  const documentExists = mockStorage.documents.some(doc => doc.id === documentId);
  if (!documentExists) {
    throw new Error('Document not found');
  }
  
  // Validate tag IDs
  const validTagIds = tagIds.filter(tagId => 
    mockStorage.tags.some(tag => tag.id === tagId)
  );
  
  // Add tags that don't already exist for this document
  validTagIds.forEach(tagId => {
    const existingRelation = mockStorage.documentTags.find(
      dt => dt.documentId === documentId && dt.tagId === tagId
    );
    
    if (!existingRelation) {
      mockStorage.documentTags.push({
        id: `doc-tag-${uuidv4()}`,
        documentId,
        tagId,
        addedAt: new Date().toISOString()
      });
    }
  });
  
  // Return all tags for this document
  return getDocumentTags(documentId);
};

/**
 * Remove a tag from a document
 * @param {string} documentId - Document ID
 * @param {string} tagId - Tag ID to remove
 * @returns {Promise<boolean>} - Success status
 */
export const removeTagFromDocument = async (documentId, tagId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const initialLength = mockStorage.documentTags.length;
  
  mockStorage.documentTags = mockStorage.documentTags.filter(
    dt => !(dt.documentId === documentId && dt.tagId === tagId)
  );
  
  return mockStorage.documentTags.length < initialLength;
};

/**
 * Get all tags for a document
 * @param {string} documentId - Document ID
 * @returns {Promise<Array>} - List of tags
 */
export const getDocumentTags = async (documentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get tag IDs for this document
  const tagIds = mockStorage.documentTags
    .filter(dt => dt.documentId === documentId)
    .map(dt => dt.tagId);
  
  // Get full tag objects
  return mockStorage.tags.filter(tag => tagIds.includes(tag.id));
};

/**
 * Get all documents with a specific tag
 * @param {string} tagId - Tag ID
 * @returns {Promise<Array>} - List of documents
 */
export const getDocumentsByTag = async (tagId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Get document IDs with this tag
  const documentIds = mockStorage.documentTags
    .filter(dt => dt.tagId === tagId)
    .map(dt => dt.documentId);
  
  // Get full document objects
  return mockStorage.documents.filter(doc => documentIds.includes(doc.id));
};

// Generate some initial sample data
const generateSampleData = () => {
  const sampleDocs = [
    {
      title: "Company Annual Report 2023",
      fileType: "pdf",
      description: "Financial statements and overview of company performance for 2023.",
      fileSize: 2.4 * 1024 * 1024
    },
    {
      title: "Project Proposal: AI Integration",
      fileType: "docx",
      description: "Detailed proposal for integrating AI into our customer service workflows.",
      fileSize: 1.8 * 1024 * 1024
    },
    {
      title: "Meeting Notes - Product Team",
      fileType: "txt",
      description: "Notes from the weekly product team meeting discussing roadmap.",
      fileSize: 0.2 * 1024 * 1024
    },
    {
      title: "Technical Documentation",
      fileType: "pdf",
      description: "API reference and implementation guide for developers.",
      fileSize: 3.5 * 1024 * 1024
    },
    {
      title: "Marketing Strategy 2024",
      fileType: "docx",
      description: "Comprehensive marketing plan and strategy for the upcoming year.",
      fileSize: 1.2 * 1024 * 1024
    }
  ];

  // Add sample documents
  sampleDocs.forEach((doc, index) => {
    const docId = `sample-doc-${index + 1}`;
    mockStorage.documents.push({
      id: docId,
      title: doc.title,
      fileName: `${doc.title.toLowerCase().replace(/\s+/g, '-')}.${doc.fileType}`,
      fileSize: doc.fileSize,
      fileType: doc.fileType,
      fileUrl: `https://example.com/documents/${docId}`,
      uploadedBy: 'user-123',
      uploadedAt: new Date(Date.now() - (index * 86400000)).toISOString(), // Each doc one day apart
      path: `documents/user-123/${docId}.${doc.fileType}`,
      description: doc.description
    });
  });

  // Add some bookmarks
  mockStorage.bookmarks.push({
    id: 'bookmark-1',
    userId: 'user-123',
    documentId: 'sample-doc-1',
    createdAt: new Date().toISOString()
  });
  
  mockStorage.bookmarks.push({
    id: 'bookmark-2',
    userId: 'user-123',
    documentId: 'sample-doc-3',
    createdAt: new Date().toISOString()
  });

  // Add sample document tags
  mockStorage.documentTags.push(
    { id: 'doc-tag-1', documentId: 'sample-doc-1', tagId: 'tag-1', addedAt: new Date().toISOString() },
    { id: 'doc-tag-2', documentId: 'sample-doc-1', tagId: 'tag-5', addedAt: new Date().toISOString() },
    { id: 'doc-tag-3', documentId: 'sample-doc-2', tagId: 'tag-2', addedAt: new Date().toISOString() },
    { id: 'doc-tag-4', documentId: 'sample-doc-3', tagId: 'tag-3', addedAt: new Date().toISOString() },
    { id: 'doc-tag-5', documentId: 'sample-doc-4', tagId: 'tag-2', addedAt: new Date().toISOString() }
  );
};

// Initialize sample data
generateSampleData();

export default {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
  updateDocumentMetadata,
  getAllDocuments,
  bookmarkDocument,
  removeBookmark,
  getBookmarkedDocuments,
  isDocumentBookmarked,
  getAllTags,
  createTag,
  addTagsToDocument,
  removeTagFromDocument,
  getDocumentTags,
  getDocumentsByTag
}; 