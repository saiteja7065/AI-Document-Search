import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import { 
  Search as SearchIcon,
  Article as ArticleIcon,
  Summarize as SummarizeIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { searchDocuments } from '../services/api';

function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchDocuments(query);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        setError(`No results found for "${query}"`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = (documentId) => {
    navigate(`/document/${documentId}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Documents
      </Typography>
      
      <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Search documents"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            helperText="Try asking a question or searching for specific information"
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            disabled={loading}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Typography variant="body1" color="error" align="center">
          {error}
        </Typography>
      )}

      {results.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Search Results
          </Typography>
          <List>
            {results.map((result) => (
              <ListItem
                key={result.document_id}
                component={Paper}
                sx={{ 
                  mb: 2, 
                  p: 2, 
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  display: 'block'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    {result.title}
                  </Typography>
                  <Chip 
                    icon={<ArticleIcon />} 
                    label={result.file_type.toUpperCase()} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {result.snippet}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Relevance: {Math.round(result.similarity_score * 100)}%
                  </Typography>
                  
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SummarizeIcon />}
                      onClick={() => navigate(`/document/${result.document_id}?summary=true`)}
                      sx={{ mr: 1 }}
                    >
                      Summarize
                    </Button>
                    
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => viewDocument(result.document_id)}
                    >
                      View
                    </Button>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Container>
  );
}

export default Search; 