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
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Summarize as SummarizeIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Storage as StorageIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { 
  getAdminDocuments, 
  adminDeleteDocument, 
  getAdminStats, 
  getAdminUsers 
} from '../services/api';

// Map file types to icons and colors
const fileTypeConfig = {
  'pdf': { icon: <PdfIcon />, color: 'error' },
  'docx': { icon: <DocIcon />, color: 'primary' },
  'txt': { icon: <FileIcon />, color: 'success' },
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

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
      
      // Fetch users
      const usersData = await getAdminUsers();
      setUsers(usersData);
      
      // Fetch stats
      const statsData = await getAdminStats();
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
      await adminDeleteDocument(documentId);
      
      // Refresh data to get updated counts
      fetchData();
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<FileIcon />} label="Documents" />
          <Tab icon={<PersonIcon />} label="Users" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Documents
                  </Typography>
                  <Typography variant="h3">
                    {stats.total_documents || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Storage Used
                  </Typography>
                  <Typography variant="h3">
                    {stats.storage_usage ? `${Math.round(stats.storage_usage / (1024 * 1024))} MB` : '0 MB'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h3">
                    {users.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Documents by Type
                  </Typography>
                  <List>
                    {stats.documents_by_type?.map((type) => (
                      <ListItem key={type.type}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getFileTypeConfig(type.type).color + '.light' }}>
                            {getFileTypeConfig(type.type).icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={`${type.type.toUpperCase()}`} 
                          secondary={`${type.count} document(s)`} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <StorageIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Vector Store" 
                        secondary={`${stats.vector_store_chunks || 'N/A'} chunks`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <DashboardIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="API Version" 
                        secondary={stats.api_version || 'N/A'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.light' }}>
                          <DashboardIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="System Status" 
                        secondary={stats.system_status || 'N/A'} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Documents Tab */}
        <TabPanel value={tabValue} index={1}>
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
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" color="textSecondary">
                        No documents found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => {
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
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Documents</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" color="textSecondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.is_admin ? 'Admin' : 'User'} 
                          color={user.is_admin ? 'secondary' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{user.document_count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default AdminDashboard; 