import React, { useState } from 'react';
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
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // TODO: Implement actual API call
      // const response = await axios.post('/api/search', { query });
      // setResults(response.data.results);
      
      // Temporary mock data
      setResults([
        { id: 1, title: 'Sample Document 1', snippet: 'This is a sample document...' },
        { id: 2, title: 'Sample Document 2', snippet: 'Another sample document...' },
      ]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
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

      {results.length > 0 && (
        <List>
          {results.map((result) => (
            <ListItem
              key={result.id}
              component={Paper}
              sx={{ mb: 2, p: 2 }}
            >
              <ListItemText
                primary={result.title}
                secondary={result.snippet}
              />
            </ListItem>
          ))}
        </List>
      )}

      {!loading && results.length === 0 && query && (
        <Typography variant="body1" color="text.secondary" align="center">
          No results found for "{query}"
        </Typography>
      )}
    </Container>
  );
}

export default Search; 