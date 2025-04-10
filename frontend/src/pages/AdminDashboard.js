import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  IconButton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Summarize as SummarizeIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { getAdminDocuments, deleteDocument, getStats } from '../services/api';

// Map file types to icons and colors
const fileTypeConfig = {
  'pdf': { icon: <PdfIcon />, color: 'error' },
  'docx': { icon: <DocIcon />, color: 'primary' },
  'txt': { icon: <FileIcon />, color: 'success' },
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch documents
      const docs = await getAdminDocuments();
      setDocuments(docs);
      
      // Fetch stats
      const statsData = await getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Error fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocument(documentId);
      
      // Update local state
      setDocuments(documents.filter(doc => doc.id !== documentId));
      
      // Update stats
      setStats({
        ...stats,
        document_count: (stats.document_count || 0) - 1
      });
    } catch (error) {
      console.error('Delete error:', error);
      setError('Error deleting document. Please try again.');
    }
  };

  const handleView = (documentId) => {
    navigate(`/document/${documentId}`);
  };

  const handleSummarize = (documentId) => {
    navigate(`/document/${documentId}?summary=true`);
  };

  const getFileTypeConfig = (fileType) => {
    const type = fileType?.toLowerCase() || 'txt';
    return fileTypeConfig[type] || { icon: <FileIcon />, color: 'default' };
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

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Statistics
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip 
              label={`Total Documents: ${stats.document_count || 0}`} 
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`Vector Store Size: ${stats.vector_store_size || 0} chunks`} 
              color="secondary"
              variant="outlined"
            />
            <Chip 
              label={`API Version: ${stats.api_version || 'N/A'}`} 
              color="info"
              variant="outlined"
            />
          </Box>
        </Paper>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Uploaded At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => {
                const fileTypeInfo = getFileTypeConfig(doc.file_type);
                
                return (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={fileTypeInfo.icon}
                        label={doc.file_type?.toUpperCase() || 'UNKNOWN'} 
                        size="small"
                        color={fileTypeInfo.color}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{doc.uploaded_by}</TableCell>
                    <TableCell>{new Date(doc.uploaded_at).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleView(doc.id)}
                        title="View Document"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      <IconButton
                        color="success"
                        onClick={() => handleSummarize(doc.id)}
                        title="Summarize Document"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <SummarizeIcon />
                      </IconButton>
                      
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(doc.id)}
                        title="Delete Document"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
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