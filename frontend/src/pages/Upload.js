import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  CircularProgress,
  LinearProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as DocIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { uploadDocument } from '../services/storageService';

// Map file types to icons
const fileTypeIcons = {
  'pdf': <PdfIcon color="error" />,
  'docx': <DocIcon color="primary" />,
  'txt': <FileIcon color="success" />,
};

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [titles, setTitles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Supported file types
  const supportedTypes = ['pdf', 'docx', 'txt'];

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processSelectedFiles(selectedFiles);
  };

  const processSelectedFiles = (selectedFiles) => {
    // Filter unsupported files and add them to the state
    const validFiles = selectedFiles.filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return supportedTypes.includes(extension);
    });

    // Initialize titles for new files
    const newTitles = { ...titles };
    validFiles.forEach(file => {
      if (!newTitles[file.name]) {
        // Remove file extension for default title
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
        newTitles[file.name] = nameWithoutExt;
      }
    });

    setTitles(newTitles);
    setFiles([...files, ...validFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processSelectedFiles(droppedFiles);
  };

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
    
    // Clean up titles and errors
    const newTitles = { ...titles };
    delete newTitles[fileName];
    setTitles(newTitles);
    
    const newErrors = { ...errors };
    delete newErrors[fileName];
    setErrors(newErrors);
  };

  const handleTitleChange = (fileName, newTitle) => {
    setTitles({ ...titles, [fileName]: newTitle });
    
    // Clear error if title provided
    if (newTitle.trim()) {
      const newErrors = { ...errors };
      delete newErrors[fileName];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    files.forEach(file => {
      if (!titles[file.name] || !titles[file.name].trim()) {
        newErrors[file.name] = 'Title is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const uploadFiles = async () => {
    if (!validateForm() || files.length === 0) return;

    setUploading(true);
    const successfulUploads = [];
    
    // Process files one at a time
    for (const file of files) {
      try {
        // Set initial progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        // Use a mock user ID until auth is implemented
        const userId = 'user-123';
        
        // Upload the file with progress tracking
        await uploadDocument(
          file, 
          titles[file.name], 
          userId,
          (progress) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        );
        
        // Add to successful uploads
        successfulUploads.push(file.name);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setErrors(prev => ({ 
          ...prev, 
          [file.name]: `Upload failed: ${error.message || 'Unknown error'}` 
        }));
      }
    }
    
    setSuccess(successfulUploads);
    
    // Clear files that were successfully uploaded
    if (successfulUploads.length > 0) {
      setFiles(files.filter(file => !successfulUploads.includes(file.name)));
    }
    
    setUploading(false);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return fileTypeIcons[extension] || <FileIcon />;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ mr: 2 }}
          aria-label="back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Upload Documents
        </Typography>
      </Box>

      {success.length > 0 && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccess([])}
        >
          Successfully uploaded {success.length} document{success.length !== 1 ? 's' : ''}
        </Alert>
      )}

      <Paper
        sx={{
          p: 3,
          mb: 3,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          backgroundColor: dragActive ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
          transition: 'all 0.2s ease-in-out',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Box 
          sx={{ 
            textAlign: 'center',
            py: 3,
          }}
        >
          <UploadIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drag & Drop Files Here
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Supported formats: PDF, DOCX, TXT
          </Typography>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".pdf,.docx,.txt"
          />
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            Select Files
          </Button>
        </Box>
      </Paper>

      {files.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Documents ({files.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {files.map((file, index) => {
              const fileName = file.name;
              const fileSize = (file.size / (1024 * 1024)).toFixed(2); // MB
              const isUploading = uploading && uploadProgress[fileName] !== undefined;
              const isUploaded = success.includes(fileName);
              
              return (
                <ListItem
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: errors[fileName] ? 'error.light' : 'divider',
                    borderRadius: 1,
                    backgroundColor: isUploaded ? 'success.light' : 'transparent',
                  }}
                >
                  <ListItemIcon>
                    {getFileIcon(fileName)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <TextField
                        fullWidth
                        label="Document Title"
                        variant="outlined"
                        size="small"
                        value={titles[fileName] || ''}
                        onChange={(e) => handleTitleChange(fileName, e.target.value)}
                        error={Boolean(errors[fileName])}
                        helperText={errors[fileName]}
                        disabled={isUploading || isUploaded}
                        sx={{ mb: 1 }}
                      />
                    }
                    secondary={
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" component="span">
                            {fileName} ({fileSize} MB)
                          </Typography>
                          <Chip 
                            label={fileName.split('.').pop().toUpperCase()} 
                            size="small" 
                            sx={{ ml: 1 }}
                            color={
                              fileName.endsWith('.pdf') ? 'error' : 
                              fileName.endsWith('.docx') ? 'primary' : 
                              'success'
                            }
                          />
                        </Box>
                        
                        {isUploading && (
                          <Box sx={{ width: '100%' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={uploadProgress[fileName]} 
                              sx={{ height: 8, borderRadius: 1 }}
                            />
                            <Typography variant="body2" align="right" color="text.secondary">
                              {Math.round(uploadProgress[fileName])}%
                            </Typography>
                          </Box>
                        )}
                      </>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    {isUploaded ? (
                      <CheckIcon color="success" />
                    ) : (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => removeFile(fileName)}
                        disabled={isUploading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              color="error"
              onClick={() => {
                setFiles([]);
                setTitles({});
                setErrors({});
              }}
              disabled={uploading || files.length === 0}
            >
              Clear All
            </Button>
            
            <Button
              variant="contained"
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
            </Button>
          </Box>
        </Paper>
      )}
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
          disabled={uploading}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Upload; 