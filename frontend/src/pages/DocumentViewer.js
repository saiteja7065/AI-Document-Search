import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import { Summarize as SummarizeIcon } from '@mui/icons-material';

function DocumentViewer() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        // TODO: Implement actual API call
        // const response = await axios.get(`/api/documents/${id}`);
        // setDocument(response.data);
        
        // Temporary mock data
        setDocument({
          id: id,
          title: 'Sample Document',
          content: 'This is a sample document content...',
          type: 'pdf',
          uploadedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      // TODO: Implement actual API call
      // const response = await axios.get(`/api/documents/${id}/summary`);
      // setSummary(response.data.summary);
      
      // Temporary mock data
      setSummary('This is a sample summary of the document...');
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!document) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Document not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {document.title}
      </Typography>

      <Box sx={{ display: 'flex', gap: 4 }}>
        <Paper sx={{ p: 3, flex: 2 }}>
          <Typography variant="body1" paragraph>
            {document.content}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            Document Summary
          </Typography>
          <Button
            variant="contained"
            startIcon={<SummarizeIcon />}
            onClick={handleSummarize}
            disabled={summarizing}
            sx={{ mb: 2 }}
          >
            Generate Summary
          </Button>

          {summarizing && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {summary && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1">
                {summary}
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default DocumentViewer; 