import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Breadcrumbs,
  Link,
  Button
} from '@mui/material';
import {
  Label as LabelIcon,
  Add as AddIcon,
  Home as HomeIcon
} from '@mui/icons-material';

import TagFilterView from '../components/TagFilterView';

function Tags() {
  const navigate = useNavigate();

  // Handle document click navigation
  const handleDocumentClick = (documentId) => {
    navigate(`/document/${documentId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <LabelIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Tags
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Browse Documents by Tag
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/upload')}
          >
            Upload New Document
          </Button>
        </Box>
      </Box>
      
      {/* Tag filter view */}
      <TagFilterView onDocumentClick={handleDocumentClick} />
    </Container>
  );
}

export default Tags; 