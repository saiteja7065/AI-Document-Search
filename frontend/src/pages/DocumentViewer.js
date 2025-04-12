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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  FormatListBulleted as BulletPointsIcon,
  Slideshow as SlideshowIcon,
  Image as ImageIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { 
  getDocument, 
  getDocumentSummary, 
  deleteDocument, 
  generateKeyPoints,
  generateSlides,
  generateImage,
  getEnhancedDocumentSummary,
  getVoiceNarration,
  getRelatedDocuments,
} from '../services/api';
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

const DocumentViewer = () => {
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
  const [keyPoints, setKeyPoints] = useState([]);
  const [slides, setSlides] = useState([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [loadingKeyPoints, setLoadingKeyPoints] = useState(false);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

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

  const handleGenerateKeyPoints = async () => {
    setLoadingKeyPoints(true);
    try {
      const result = await generateKeyPoints(id);
      setKeyPoints(result.key_points);
      // If slides tab is active, automatically convert bullet points to slides
      if (tabValue === 2) {
        handleGenerateSlides();
      }
    } catch (error) {
      console.error('Error generating key points:', error);
      setError('Failed to generate key points. Please try again.');
    } finally {
      setLoadingKeyPoints(false);
    }
  };

  const handleGenerateSlides = async () => {
    setLoadingSlides(true);
    try {
      const result = await generateSlides(id);
      setSlides(result.slides);
    } catch (error) {
      console.error('Error generating slides:', error);
      setError('Failed to generate slides. Please try again.');
    } finally {
      setLoadingSlides(false);
    }
  };

  const handleGenerateImage = async () => {
    setLoadingImage(true);
    try {
      const result = await generateImage(id, imagePrompt);
      setGeneratedImageUrl(result.image_url);
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoadingImage(false);
      setImageDialogOpen(false);
    }
  };

  const handleVoiceNarration = async () => {
    try {
      const audioBlob = await getVoiceNarration(id);
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
    } catch (error) {
      console.error('Error generating voice narration:', error);
      setError('Failed to generate voice narration. Please try again.');
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {document?.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Chip 
                label={document?.fileType?.toUpperCase() || 'DOCUMENT'} 
                color="primary"
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                Uploaded: {document?.uploadedAt && new Date(document.uploadedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<VolumeUpIcon />}
              onClick={handleVoiceNarration}
            >
              Narrate
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Summary" icon={<SummarizeIcon />} />
          <Tab label="Key Points" icon={<BulletPointsIcon />} />
          <Tab label="Slides" icon={<SlideshowIcon />} />
          <Tab label="Images" icon={<ImageIcon />} />
          <Tab label="Insights" icon={<InfoIcon />} />
          <Tab label="Related" icon={<LinkIcon />} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Document Summary</Typography>
              <Button
                variant="contained"
                startIcon={<SummarizeIcon />}
                onClick={handleSummarize}
                disabled={summarizing}
              >
                Generate Summary
              </Button>
            </Box>
            {summarizing ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography>{summary || 'Click Generate Summary to analyze the document'}</Typography>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Key Points</Typography>
              <Button
                variant="contained"
                startIcon={<BulletPointsIcon />}
                onClick={handleGenerateKeyPoints}
                disabled={loadingKeyPoints}
              >
                Extract Key Points
              </Button>
            </Box>
            {loadingKeyPoints ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {keyPoints.map((point, index) => (
                  <Typography key={index} paragraph>
                    • {point}
                  </Typography>
                ))}
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Presentation Slides</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<BulletPointsIcon />}
                  onClick={handleGenerateKeyPoints}
                  disabled={loadingKeyPoints}
                >
                  From Key Points
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SlideshowIcon />}
                  onClick={handleGenerateSlides}
                  disabled={loadingSlides}
                >
                  Generate Slides
                </Button>
              </Box>
            </Box>
            {(loadingSlides || loadingKeyPoints) ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {slides.map((slide, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Slide {index + 1}
                      </Typography>
                      <Typography>{slide}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Generate Images</Typography>
              <Button
                variant="contained"
                startIcon={<ImageIcon />}
                onClick={() => setImageDialogOpen(true)}
              >
                Create Image
              </Button>
            </Box>
            {generatedImageUrl && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={generatedImageUrl}
                  alt="AI-generated visualization"
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <DocumentInsights documentId={id} />
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <RelatedDocuments documentId={id} />
          </TabPanel>
        </Box>
      </Paper>

      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)}>
        <DialogTitle>Generate Image</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Describe the image you want to generate"
            fullWidth
            multiline
            rows={3}
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleGenerateImage}
            disabled={!imagePrompt || loadingImage}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentViewer;