import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

function Upload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setError(null);
      setSuccess(false);
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // TODO: Implement actual API call
      // const formData = new FormData();
      // files.forEach(file => formData.append('files', file));
      // await axios.post('/api/upload', formData);
      
      // Temporary success message
      setSuccess(true);
      setFiles([]);
    } catch (error) {
      setError('Error uploading files. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Documents
      </Typography>

      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          mb: 4,
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? 'Drop the files here'
            : 'Drag and drop files here, or click to select files'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supported formats: PDF, DOCX, TXT (Max size: 10MB)
        </Typography>
      </Paper>

      {files.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Selected Files:
          </Typography>
          {files.map((file, index) => (
            <Paper key={index} sx={{ p: 2, mb: 1 }}>
              <Typography>{file.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Files uploaded successfully!
        </Alert>
      )}

      <Button
        variant="contained"
        size="large"
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
        startIcon={uploading ? <CircularProgress size={20} /> : null}
      >
        {uploading ? 'Uploading...' : 'Upload Files'}
      </Button>
    </Container>
  );
}

export default Upload; 