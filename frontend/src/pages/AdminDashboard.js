import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

function AdminDashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      // TODO: Implement actual API call
      // const response = await axios.get('/api/admin/documents');
      // setDocuments(response.data);
      
      // Temporary mock data
      setDocuments([
        {
          id: 1,
          title: 'Sample Document 1',
          type: 'pdf',
          size: '2.5 MB',
          uploadedAt: '2024-03-15',
          uploadedBy: 'user@example.com',
        },
        {
          id: 2,
          title: 'Sample Document 2',
          type: 'docx',
          size: '1.8 MB',
          uploadedAt: '2024-03-14',
          uploadedBy: 'admin@example.com',
        },
      ]);
    } catch (error) {
      setError('Error fetching documents. Please try again.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      // TODO: Implement actual API call
      // await axios.delete(`/api/admin/documents/${documentId}`);
      
      // Update local state
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (error) {
      setError('Error deleting document. Please try again.');
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Uploaded At</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>{doc.type.toUpperCase()}</TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>{doc.uploadedAt}</TableCell>
                  <TableCell>{doc.uploadedBy}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(doc.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {documents.length === 0 && !error && (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No documents found in the system.
        </Typography>
      )}
    </Container>
  );
}

export default AdminDashboard; 