import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import {
  Description as DocIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { getRelatedDocuments } from '../services/api';

// Demo related documents data (will be replaced with API call)
const DEMO_RELATED_DOCS = [
  {
    id: 'rel1',
    title: 'Related Document 1',
    file_type: 'pdf',
    similarity: 0.85,
    snippet: 'This document contains related information to the current topic...'
  },
  {
    id: 'rel2',
    title: 'Related Document 2',
    file_type: 'docx',
    similarity: 0.72,
    snippet: 'Additional information that might be relevant to your search...'
  },
  {
    id: 'rel3',
    title: 'Related Document 3',
    file_type: 'txt',
    similarity: 0.65,
    snippet: 'This file contains supplementary material on the subject...'
  }
];

// Map file types to icons
const fileTypeIcons = {
  'pdf': <PdfIcon color="error" />,
  'docx': <DocIcon color="primary" />,
  'txt': <FileIcon color="success" />,
};

const RelatedDocuments = ({ documentId }) => {
  const navigate = useNavigate();
  const [relatedDocs, setRelatedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedDocuments = async () => {
      try {
        const response = await getRelatedDocuments(documentId);
        setRelatedDocs(response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching related documents:', error);
        setError('Failed to load related documents');
        setLoading(false);
      }
    };

    if (documentId) {
      fetchRelatedDocuments();
    }
  }, [documentId]);

  const handleDocumentClick = (docId) => {
    navigate(`/document/${docId}`);
  };

  const getFileIcon = (fileType) => {
    return fileTypeIcons[fileType.toLowerCase()] || <FileIcon />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2">
        {error}
      </Typography>
    );
  }

  if (relatedDocs.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No related documents found.
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Related Documents
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <List dense disablePadding>
        {relatedDocs.map((doc) => (
          <ListItem
            key={doc.id}
            sx={{ 
              mb: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
            onClick={() => handleDocumentClick(doc.id)}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {getFileIcon(doc.file_type)}
            </ListItemIcon>
            
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" noWrap>
                    {doc.title}
                  </Typography>
                  <Chip 
                    label={`${Math.round(doc.similarity * 100)}%`}
                    size="small"
                    color={doc.similarity > 0.8 ? 'success' : doc.similarity > 0.6 ? 'primary' : 'default'}
                    variant="outlined"
                    sx={{ ml: 1, minWidth: 60 }}
                  />
                </Box>
              }
              secondary={
                <Typography variant="body2" color="text.secondary" noWrap>
                  {doc.snippet}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default RelatedDocuments;