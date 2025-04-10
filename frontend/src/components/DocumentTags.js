import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Label as LabelIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Check as CheckIcon
} from '@mui/icons-material';

import { getTags, createTag, getDocumentTagsByDocId, addTagsToDoc, removeTagFromDoc } from '../services/api';

/**
 * Component for displaying and managing tags for a document
 * 
 * @param {Object} props
 * @param {string} props.documentId - The ID of the document
 * @param {boolean} props.readOnly - Whether the tags are editable or not
 * @param {boolean} props.showLabel - Whether to show the "Tags:" label
 * @param {string} props.variant - Display variant (default: 'standard', options: 'small', 'outlined')
 * @param {Function} props.onTagsChange - Callback when tags are added or removed
 */
const DocumentTags = ({
  documentId,
  readOnly = false,
  showLabel = true,
  variant = 'standard',
  onTagsChange = () => {}
}) => {
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2196f3');
  const [tagProcessing, setTagProcessing] = useState(false);

  // Fetch document tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get document tags
        const documentTags = await getDocumentTagsByDocId(documentId);
        setTags(documentTags);
        
        // Get all available tags for the dialog
        const allTags = await getTags();
        setAvailableTags(allTags);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load tags');
        setLoading(false);
      }
    };
    
    fetchTags();
  }, [documentId]);

  // Handle adding tag to document
  const handleAddTag = async (tagId) => {
    try {
      setTagProcessing(true);
      const updatedTags = await addTagsToDoc(documentId, [tagId]);
      setTags(updatedTags);
      onTagsChange(updatedTags);
      setDialogOpen(false);
    } catch (err) {
      console.error('Error adding tag:', err);
      setError('Failed to add tag');
    } finally {
      setTagProcessing(false);
    }
  };

  // Handle removing tag from document
  const handleRemoveTag = async (tagId) => {
    try {
      setTagProcessing(true);
      const success = await removeTagFromDoc(documentId, tagId);
      
      if (success) {
        setTags(tags.filter(tag => tag.id !== tagId));
        onTagsChange(tags.filter(tag => tag.id !== tagId));
      }
    } catch (err) {
      console.error('Error removing tag:', err);
      setError('Failed to remove tag');
    } finally {
      setTagProcessing(false);
    }
  };

  // Handle creating a new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      setTagProcessing(true);
      const newTag = await createTag(newTagName, newTagColor);
      
      // Add new tag to available tags
      setAvailableTags([...availableTags, newTag]);
      
      // Add new tag to document
      await handleAddTag(newTag.id);
      
      // Reset form
      setNewTagName('');
      setNewTagDialogOpen(false);
    } catch (err) {
      console.error('Error creating tag:', err);
      setError(err.message || 'Failed to create tag');
    } finally {
      setTagProcessing(false);
    }
  };

  // Styling based on variant
  const getChipSize = () => {
    return variant === 'small' ? 'small' : 'medium';
  };
  
  const getChipVariant = () => {
    return variant === 'outlined' ? 'outlined' : 'filled';
  };

  // If loading, show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showLabel && (
          <Typography variant="body2" component="span" color="text.secondary">
            Tags:
          </Typography>
        )}
        <CircularProgress size={20} />
      </Box>
    );
  }

  // If no tags and read-only, don't render anything
  if (tags.length === 0 && readOnly) {
    return null;
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        {showLabel && (
          <Typography variant="body2" component="span" color="text.secondary">
            Tags:
          </Typography>
        )}
        
        {tags.map(tag => (
          <Chip
            key={tag.id}
            label={tag.name}
            size={getChipSize()}
            variant={getChipVariant()}
            sx={{ 
              backgroundColor: variant !== 'outlined' ? tag.color : 'transparent',
              color: variant !== 'outlined' ? '#fff' : tag.color,
              borderColor: tag.color
            }}
            onDelete={!readOnly ? () => handleRemoveTag(tag.id) : undefined}
            disabled={tagProcessing}
          />
        ))}
        
        {!readOnly && (
          <Tooltip title="Add tag">
            <IconButton 
              size="small" 
              onClick={() => setDialogOpen(true)}
              color="primary"
              disabled={tagProcessing}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {/* Add Tag Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Add Tags
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List sx={{ width: '100%' }}>
            {availableTags
              .filter(tag => !tags.some(t => t.id === tag.id))
              .map(tag => (
                <ListItem
                  key={tag.id}
                  button
                  onClick={() => handleAddTag(tag.id)}
                  disabled={tagProcessing}
                  secondaryAction={
                    <Chip 
                      size="small" 
                      sx={{ backgroundColor: tag.color, color: '#fff' }} 
                      label={tag.name} 
                    />
                  }
                >
                  <ListItemText primary={tag.name} />
                </ListItem>
              ))}
          </List>
          
          {availableTags.filter(tag => !tags.some(t => t.id === tag.id)).length === 0 && (
            <Typography color="text.secondary" align="center" sx={{ my: 2 }}>
              No more tags available
            </Typography>
          )}
          
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              setDialogOpen(false);
              setNewTagDialogOpen(true);
            }}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Create New Tag
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Create New Tag Dialog */}
      <Dialog 
        open={newTagDialogOpen} 
        onClose={() => setNewTagDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Create New Tag
          <IconButton
            aria-label="close"
            onClick={() => setNewTagDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            fullWidth
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            Tag Color
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', 
              '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', 
              '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', 
              '#607d8b'].map(color => (
              <Box
                key={color}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: color,
                  cursor: 'pointer',
                  border: newTagColor === color ? '2px solid #000' : '2px solid transparent',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={() => setNewTagColor(color)}
              />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mr: 2 }}>
              Preview:
            </Typography>
            <Chip 
              label={newTagName || "New Tag"} 
              sx={{ backgroundColor: newTagColor, color: '#fff' }} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTagDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateTag}
            disabled={!newTagName.trim() || tagProcessing}
            variant="contained"
            startIcon={tagProcessing ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentTags; 