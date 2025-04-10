import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  Divider,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import {
  Summarize as SummarizeIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Description as DescriptionIcon,
  Link as LinkIcon,
  AutoAwesome as AutoAwesomeIcon,
  QuestionAnswer as QuestionAnswerIcon,
} from '@mui/icons-material';
import { getDocument, getDocumentSummary, deleteDocument } from '../services/api';
import RelatedDocuments from '../components/RelatedDocuments';
import DocumentTags from '../components/DocumentTags';
import DocumentInsights from '../components/DocumentInsights';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function DocumentViewer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryType, setSummaryType] = useState('general');
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [answerLoading, setAnswerLoading] = useState(false);

  // Check if we should generate a summary immediately
  const shouldGenerateSummary = searchParams.get('summary') === 'true';

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const documentData = await getDocument(id);
        setDocument(documentData);
        
        // Generate summary automatically if requested in URL
        if (shouldGenerateSummary) {
          handleSummarize();
          setTabValue(1); // Switch to Summary tab
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, shouldGenerateSummary]);

  const handleSummarize = async () => {
    setSummarizing(true);
    setError(null);
    
    try {
      const summaryResult = await getDocumentSummary(id, summaryType, 500);
      setSummary(summaryResult.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setSummarizing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDocument(id);
      navigate('/search', { state: { message: 'Document deleted successfully' } });
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document. Please try again.');
    }
  };

  const handleDownload = () => {
    if (document && document.fileUrl) {
      window.open(document.fileUrl, '_blank');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // If switching to summary tab and no summary yet, generate one
    if (newValue === 1 && !summary && !summarizing) {
      handleSummarize();
    }
  };

  const handleAskQuestion = async () => {
    setAnswerLoading(true);
    setError(null);
    
    try {
      const answerResult = await getDocumentSummary(id, 'general', 500);
      setAnswer(answerResult.summary);
    } catch (error) {
      console.error('Error asking question:', error);
      setError('Failed to ask question. Please try again.');
    } finally {
      setAnswerLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !document) {
    return (
      <Container>
        <Typography variant="h6" color="error" sx={{ mt: 4 }}>
          {error || 'Document not found'}
        </Typography>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/search')}
          sx={{ mt: 2 }}
        >
          Back to Search
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {document.title}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Size: {document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Type: {document.fileType ? document.fileType.toUpperCase() : 'Document'}
              </Typography>
            </Box>

            <DocumentTags documentId={id} variant="small" />
          </Box>
          
          <Box>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ mr: 1 }}
            >
              Download
            </Button>
            <IconButton 
              color="error" 
              onClick={handleDelete}
              aria-label="delete document"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="document viewer tabs">
          <Tab label="Document" />
          <Tab label="Summary" />
          <Tab label="Insights" />
          <Tab label="Ask Questions" />
          <Tab label="Related" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Document Content
            </Typography>
            <Chip 
              label={document.fileType?.toUpperCase() || 'DOCUMENT'} 
              size="small"
              color="primary"
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {document.fileUrl ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" paragraph>
                This is a preview of {document.fileName || 'the document'}.
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download to View
              </Button>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Document content not available for preview.
            </Typography>
          )}
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Document Summary
            </Typography>
            <Box>
              <Button 
                size="small" 
                startIcon={<AutoAwesomeIcon />} 
                variant="outlined"
                sx={{ mr: 1 }}
                onClick={() => setSummaryType('key_points')}
                color={summaryType === 'key_points' ? 'primary' : 'inherit'}
              >
                Key Points
              </Button>
              <Button 
                size="small" 
                startIcon={<DescriptionIcon />} 
                variant="outlined"
                onClick={() => setSummaryType('detailed')}
                color={summaryType === 'detailed' ? 'primary' : 'inherit'}
              >
                Detailed
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {summarizing ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {summary ? (
                <Box>
                  <Typography variant="body1" paragraph>
                    {summary.summary.split('\n\n').map((paragraph, i) => (
                      <React.Fragment key={i}>
                        {paragraph}
                        <br /><br />
                      </React.Fragment>
                    ))}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No summary available for this document.
                </Typography>
              )}
            </>
          )}
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <DocumentInsights documentId={id} />
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ask Questions
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <TextField
            fullWidth
            label="Ask a question about this document"
            placeholder="E.g., What is the main topic? When was this created?"
            variant="outlined"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            startIcon={<QuestionAnswerIcon />}
            onClick={handleAskQuestion}
            disabled={!question || answerLoading}
          >
            Ask Question
          </Button>
          
          {answerLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {answer && (
            <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Answer:
              </Typography>
              <Typography variant="body1">
                {answer.answer}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Chip 
                  size="small" 
                  label={`Confidence: ${Math.round(answer.confidence * 100)}%`} 
                  color={answer.confidence > 0.8 ? 'success' : 'default'} 
                />
              </Box>
            </Paper>
          )}
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <RelatedDocuments documentId={id} />
      </TabPanel>
    </Container>
  );
}

export default DocumentViewer; 