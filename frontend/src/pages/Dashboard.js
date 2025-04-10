import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Skeleton,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Description as DocIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  CloudUpload as UploadIcon,
  TrendingUp as TrendingUpIcon,
  Bookmark as BookmarkIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  FormatListBulleted as ListIcon,
  GridView as GridViewIcon,
} from '@mui/icons-material';
import DocumentCard from '../components/DocumentCard';

// Demo recent searches data
const RECENT_SEARCHES = [
  { id: 1, query: "AI implementation strategies", timestamp: "2024-05-01T14:32:00" },
  { id: 2, query: "Machine learning best practices", timestamp: "2024-04-29T09:15:00" },
  { id: 3, query: "Data processing techniques", timestamp: "2024-04-28T16:45:00" },
];

// Demo document type stats
const DOCUMENT_STATS = [
  { type: 'pdf', count: 12, color: 'error' },
  { type: 'docx', count: 8, color: 'primary' },
  { type: 'txt', count: 5, color: 'success' },
];

// Map file types to icons
const fileTypeIcons = {
  'pdf': <PdfIcon />,
  'docx': <DocIcon />,
  'txt': <FileIcon />,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [bookmarkedDocs, setBookmarkedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Simulating API call to fetch recent documents
    const fetchRecentDocuments = async () => {
      try {
        setLoading(true);
        // In a real application, this would be an API call
        setTimeout(() => {
          // Mock data for recent documents
          const mockRecentDocs = [
            {
              id: 1,
              title: "Q3 Financial Report",
              file_type: "pdf",
              uploaded_at: "2023-12-01T10:30:00Z",
              summary: "Quarterly financial report for Q3 2023 with detailed analysis of revenue and expenses.",
            },
            {
              id: 2,
              title: "Project Proposal - AI Integration",
              file_type: "docx",
              uploaded_at: "2023-11-29T14:20:00Z",
              summary: "Proposal for implementing AI solutions across departments to improve efficiency.",
            },
            {
              id: 3,
              title: "Employee Handbook 2023",
              file_type: "pdf",
              uploaded_at: "2023-11-28T09:15:00Z",
              summary: "Updated employee handbook with new policies and procedures for 2023.",
            },
            {
              id: 4,
              title: "Client Meeting Notes",
              file_type: "txt",
              uploaded_at: "2023-11-25T16:45:00Z",
              summary: "Notes from the client meeting discussing project timeline and deliverables.",
            },
          ];

          const mockBookmarkedDocs = [
            {
              id: 5,
              title: "2023 Strategic Plan",
              file_type: "pdf",
              uploaded_at: "2023-10-15T08:20:00Z",
              summary: "Company's strategic objectives and initiatives for the fiscal year 2023.",
            },
            {
              id: 6,
              title: "Legal Contract Template",
              file_type: "docx",
              uploaded_at: "2023-09-22T13:40:00Z",
              summary: "Standardized legal contract template for new client engagements.",
            },
          ];

          setRecentDocuments(mockRecentDocs);
          setBookmarkedDocs(mockBookmarkedDocs);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch recent documents');
        setLoading(false);
      }
    };

    fetchRecentDocuments();
  }, []);

  const handleBookmark = (docId) => {
    // In a real app, this would call an API to toggle bookmark status
    
    // For this mock implementation, we'll just toggle between lists
    const doc = recentDocuments.find(doc => doc.id === docId) || 
               bookmarkedDocs.find(doc => doc.id === docId);
    
    if (!doc) return;
    
    if (bookmarkedDocs.some(d => d.id === docId)) {
      // Remove from bookmarked
      setBookmarkedDocs(bookmarkedDocs.filter(d => d.id !== docId));
      setRecentDocuments([...recentDocuments, doc]);
    } else {
      // Add to bookmarked
      setBookmarkedDocs([...bookmarkedDocs, doc]);
      setRecentDocuments(recentDocuments.filter(d => d.id !== docId));
    }
  };

  const handleDelete = (docId) => {
    // In a real app, this would call an API to delete the document
    // For now, just remove from the local state
    setRecentDocuments(recentDocuments.filter(doc => doc.id !== docId));
    setBookmarkedDocs(bookmarkedDocs.filter(doc => doc.id !== docId));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderStatsCards = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">{DOCUMENT_STATS.reduce((sum, stat) => sum + stat.count, 0)}</Typography>
            <Typography variant="body2" color="text.secondary">Total Documents</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">{recentDocuments.length}</Typography>
            <Typography variant="body2" color="text.secondary">Recent Uploads</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">{RECENT_SEARCHES.length}</Typography>
            <Typography variant="body2" color="text.secondary">Searches Made</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">{bookmarkedDocs.length}</Typography>
            <Typography variant="body2" color="text.secondary">Saved Searches</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderDocumentList = (documents, isBookmarked = false) => {
    if (loading) {
      return viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {Array.from(new Array(4)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper variant="outlined">
          {Array.from(new Array(4)).map((_, index) => (
            <Box key={index} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
              <Skeleton variant="text" width="70%" height={30} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          ))}
        </Paper>
      );
    }

    if (error) {
      return (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      );
    }

    if (documents.length === 0) {
      return (
        <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No documents found</Typography>
          <Button 
            startIcon={<UploadIcon />} 
            variant="contained" 
            onClick={() => navigate('/upload')}
            sx={{ mt: 2 }}
          >
            Upload Documents
          </Button>
        </Paper>
      );
    }

    if (viewMode === 'grid') {
      return (
        <Grid container spacing={3}>
          {documents.map(doc => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
              <DocumentCard 
                document={doc}
                onDelete={handleDelete}
                onBookmark={handleBookmark}
                isBookmarked={isBookmarked}
              />
            </Grid>
          ))}
        </Grid>
      );
    } else {
      return (
        <Paper variant="outlined">
          <List>
            {documents.map(doc => (
              <ListItem
                key={doc.id}
                divider
                button
                onClick={() => navigate(`/document/${doc.id}`)}
              >
                <DocumentCard 
                  document={doc}
                  compact={true}
                  onDelete={handleDelete}
                  onBookmark={handleBookmark}
                  isBookmarked={isBookmarked}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      );
    }
  };

  const renderRecentSearches = () => {
    return (
      <Paper elevation={0} variant="outlined">
        <List>
          {RECENT_SEARCHES.map((search) => (
            <ListItem
              key={search.id}
              divider
              button
              onClick={() => navigate(`/search?query=${encodeURIComponent(search.query)}`)}
            >
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText
                primary={search.query}
                secondary={new Date(search.timestamp).toLocaleDateString()}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Grid container spacing={3}>
        {/* Header section */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">Dashboard</Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => navigate('/upload')}
                sx={{ mr: 1 }}
              >
                Upload
              </Button>
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => navigate('/search')}
              >
                Search
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Statistics section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Statistics
            </Typography>
            {renderStatsCards()}
          </Box>
        </Grid>

        {/* Document section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Recent Documents" />
                <Tab label="Bookmarked" />
              </Tabs>
              <Box>
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                >
                  <ListIcon />
                </IconButton>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <GridViewIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              {activeTab === 0 ? 
                renderDocumentList(recentDocuments) : 
                renderDocumentList(bookmarkedDocs, true)
              }
            </Box>
          </Box>
        </Grid>

        {/* Recent searches section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Searches
            </Typography>
            {renderRecentSearches()}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 