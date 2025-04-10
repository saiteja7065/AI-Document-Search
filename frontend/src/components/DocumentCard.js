import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Chip,
  Box,
  Tooltip
} from '@mui/material';
import {
  Description as DocIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

// Map file types to icons and colors
const fileTypeConfig = {
  pdf: { icon: <PdfIcon />, color: 'error' },
  docx: { icon: <DocIcon />, color: 'primary' },
  txt: { icon: <FileIcon />, color: 'success' },
  jpg: { icon: <ImageIcon />, color: 'secondary' },
  jpeg: { icon: <ImageIcon />, color: 'secondary' },
  png: { icon: <ImageIcon />, color: 'secondary' },
  js: { icon: <CodeIcon />, color: 'warning' },
  default: { icon: <FileIcon />, color: 'default' }
};

/**
 * A reusable card component for displaying document information
 * 
 * @param {Object} props
 * @param {Object} props.document - The document object with all document properties
 * @param {Function} props.onDelete - Function to call when delete is clicked
 * @param {Function} props.onBookmark - Function to call when bookmark is toggled
 * @param {Function} props.onShare - Function to call when share is clicked
 * @param {boolean} props.isBookmarked - Whether the document is bookmarked
 * @param {boolean} props.hideActions - Whether to hide action buttons
 * @param {string} props.variant - Display variant (default: 'standard', options: 'compact', 'detailed')
 */
const DocumentCard = ({
  document,
  onDelete,
  onBookmark,
  onShare,
  isBookmarked = false,
  hideActions = false,
  variant = 'standard'
}) => {
  const navigate = useNavigate();
  
  // Handle card click to navigate to document viewer
  const handleCardClick = () => {
    navigate(`/document/${document.id}`);
  };
  
  // Get file type icon and color
  const getFileTypeConfig = (fileType) => {
    const type = fileType?.toLowerCase() || 'default';
    return fileTypeConfig[type] || fileTypeConfig.default;
  };
  
  const fileType = document.fileType || document.file_type || 'default';
  const { icon, color } = getFileTypeConfig(fileType);
  
  // Share document
  const handleShare = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onShare) {
      onShare(document);
    } else {
      alert(`Sharing document: ${document.title}`);
    }
  };
  
  // Toggle bookmark status
  const handleBookmark = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onBookmark) {
      onBookmark(document, !isBookmarked);
    }
  };
  
  // Delete document
  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onDelete) {
      onDelete(document);
    }
  };
  
  return (
    <Card 
      sx={{ 
        height: variant === 'compact' ? 'auto' : '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardActionArea onClick={handleCardClick} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="div"
          sx={{
            height: variant === 'compact' ? 80 : 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }}
        >
          {React.cloneElement(icon, { 
            style: { fontSize: variant === 'compact' ? 40 : 64 },
            color: color
          })}
        </CardMedia>
        
        <CardContent sx={{ pb: variant === 'compact' ? 1 : 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography 
              gutterBottom 
              variant={variant === 'compact' ? 'subtitle1' : 'h6'} 
              component="div"
              sx={{ 
                mb: 0, 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {document.title}
            </Typography>
            
            <Chip 
              icon={icon}
              label={fileType.toUpperCase()}
              size="small"
              color={color}
              variant="outlined"
              sx={{ ml: 1, flexShrink: 0 }}
            />
          </Box>
          
          {variant === 'detailed' && document.description && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mb: 1
              }}
            >
              {document.description}
            </Typography>
          )}
          
          {variant !== 'compact' && (
            <Typography variant="caption" color="text.secondary" display="block">
              Uploaded: {new Date(document.uploadedAt || document.uploaded_at).toLocaleDateString()}
            </Typography>
          )}
          
          {variant === 'detailed' && document.fileSize && (
            <Typography variant="caption" color="text.secondary" display="block">
              Size: {(document.fileSize / 1024 / 1024).toFixed(2)} MB
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
      
      {!hideActions && (
        <CardActions 
          disableSpacing 
          sx={{ 
            justifyContent: 'flex-end',
            p: variant === 'compact' ? '0 8px 8px' : undefined
          }}
        >
          <Tooltip title={isBookmarked ? "Remove bookmark" : "Bookmark"}>
            <IconButton 
              size="small" 
              onClick={handleBookmark}
              color={isBookmarked ? "primary" : "default"}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark document"}
            >
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Share">
            <IconButton 
              size="small"
              onClick={handleShare}
              aria-label="Share document"
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete">
            <IconButton 
              size="small"
              onClick={handleDelete}
              color="error"
              aria-label="Delete document"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  );
};

export default DocumentCard; 