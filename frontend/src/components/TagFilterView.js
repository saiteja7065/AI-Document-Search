import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Label as LabelIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

import { getTags, searchDocumentsByTag } from '../services/api';
import DocumentCard from './DocumentCard';

/**
 * Component for browsing and filtering documents by tags
 * 
 * @param {Object} props
 * @param {Function} props.onDocumentClick - Callback when a document is clicked
 */
const TagFilterView = ({ onDocumentClick = () => {} }) => {
  const [tags, setTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all available tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allTags = await getTags();
        setTags(allTags);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags');
        setLoading(false);
      }
    };
    
    fetchTags();
  }, []);

  // Fetch documents when a tag is selected
  useEffect(() => {
    const fetchDocumentsByTag = async () => {
      if (!selectedTagId) {
        setDocuments([]);
        return;
      }
      
      try {
        setDocumentsLoading(true);
        setError(null);
        
        const docs = await searchDocumentsByTag(selectedTagId);
        setDocuments(docs);
        
        setDocumentsLoading(false);
      } catch (err) {
        console.error('Error fetching documents by tag:', err);
        setError('Failed to load documents for this tag');
        setDocumentsLoading(false);
      }
    };
    
    fetchDocumentsByTag();
  }, [selectedTagId]);

  // Handle tag selection
  const handleTagSelect = (tagId) => {
    if (selectedTagId === tagId) {
      // Clear selection if the same tag is clicked again
      setSelectedTagId(null);
    } else {
      setSelectedTagId(tagId);
    }
  };

  // Get the selected tag object
  const getSelectedTag = () => {
    return tags.find(tag => tag.id === selectedTagId);
  };

  // Handle deleting a document from the list
  const handleDeleteDocument = (document) => {
    setDocuments(documents.filter(doc => doc.id !== document.id));
  };

  // If loading, show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            Browse by Tag
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {tags.map(tag => (
            <Chip
              key={tag.id}
              label={tag.name}
              icon={<LabelIcon />}
              onClick={() => handleTagSelect(tag.id)}
              color={selectedTagId === tag.id ? 'primary' : 'default'}
              variant={selectedTagId === tag.id ? 'filled' : 'outlined'}
              sx={{ 
                borderColor: tag.color,
                bgcolor: selectedTagId === tag.id ? tag.color : 'transparent',
                color: selectedTagId === tag.id ? '#fff' : tag.color
              }}
            />
          ))}
          
          {tags.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No tags available. Create tags for your documents to enable filtering.
            </Typography>
          )}
        </Box>
        
        {selectedTagId && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2">
              Filtering by:
            </Typography>
            <Chip
              label={getSelectedTag()?.name}
              size="small"
              sx={{ 
                ml: 1,
                backgroundColor: getSelectedTag()?.color,
                color: '#fff'
              }}
              onDelete={() => setSelectedTagId(null)}
              deleteIcon={<ClearIcon style={{ color: '#fff' }} />}
            />
          </Box>
        )}
      </Paper>
      
      {selectedTagId && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LabelIcon sx={{ mr: 1, color: getSelectedTag()?.color }} />
            Documents tagged with "{getSelectedTag()?.name}"
            {documentsLoading && (
              <CircularProgress size={20} sx={{ ml: 2 }} />
            )}
          </Typography>
          
          {!documentsLoading && documents.length === 0 && (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                No documents found with this tag.
              </Typography>
            </Paper>
          )}
          
          {!documentsLoading && documents.length > 0 && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {documents.map(doc => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                  <DocumentCard 
                    document={doc}
                    onDelete={handleDeleteDocument}
                    onClick={() => onDocumentClick(doc.id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
      
      {!selectedTagId && tags.length > 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            Select a tag above to see related documents.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TagFilterView; 