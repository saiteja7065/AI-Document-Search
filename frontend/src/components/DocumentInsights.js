import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  IconButton,
  Button,
  LinearProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Insights as InsightsIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  AutoGraph as AutoGraphIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

import { getDocumentInsights } from '../services/api';
import DocumentTags from './DocumentTags';

/**
 * Component for displaying document insights and analysis
 * 
 * @param {Object} props
 * @param {string} props.documentId - The ID of the document
 */
const DocumentInsights = ({ documentId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getDocumentInsights(documentId);
        setInsights(data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching document insights:', err);
        setError('Failed to load document insights');
        setLoading(false);
      }
    };
    
    fetchInsights();
  }, [documentId]);

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1">
          Analyzing document content...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This may take a moment
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button 
            color="inherit" 
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <InsightsIcon sx={{ mr: 1 }} />
          Document Insights
        </Typography>
        <Tooltip title="Download analysis">
          <IconButton>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Grid container spacing={3}>
        {/* Sentiment Analysis */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AnalyticsIcon sx={{ mr: 1, fontSize: 20 }} />
                Sentiment Analysis
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={insights.sentiment_analysis.sentiment_breakdown.positive * 100}
                    color="success"
                    size={120}
                    thickness={5}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="h6" component="div">
                      {Math.round(insights.sentiment_analysis.sentiment_breakdown.positive * 100)}%
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary">
                      Positive
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography align="center" variant="body2">
                    Positive
                    <LinearProgress 
                      variant="determinate" 
                      value={insights.sentiment_analysis.sentiment_breakdown.positive * 100} 
                      color="success"
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(insights.sentiment_analysis.sentiment_breakdown.positive * 100)}%
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography align="center" variant="body2">
                    Neutral
                    <LinearProgress 
                      variant="determinate" 
                      value={insights.sentiment_analysis.sentiment_breakdown.neutral * 100}
                      color="primary" 
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(insights.sentiment_analysis.sentiment_breakdown.neutral * 100)}%
                    </Typography>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography align="center" variant="body2">
                    Negative
                    <LinearProgress 
                      variant="determinate" 
                      value={insights.sentiment_analysis.sentiment_breakdown.negative * 100} 
                      color="error"
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(insights.sentiment_analysis.sentiment_breakdown.negative * 100)}%
                    </Typography>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Readability */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AssessmentIcon sx={{ mr: 1, fontSize: 20 }} />
                Readability & Metrics
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Readability Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ mr: 1 }}>
                      {insights.readability.score}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={insights.readability.complexity} 
                      color={
                        insights.readability.complexity === 'Simple' ? 'success' :
                        insights.readability.complexity === 'Moderate' ? 'info' : 'warning'
                      }
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Grade Level
                  </Typography>
                  <Typography variant="h6">
                    {insights.readability.grade_level}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Reading Time
                  </Typography>
                  <Typography variant="h6">
                    {insights.readability.reading_time}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Overall Sentiment
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center' }}
                  >
                    {insights.sentiment_analysis.overall_sentiment}
                    <Chip 
                      size="small" 
                      label={`${Math.round(insights.sentiment_analysis.confidence * 100)}%`}
                      sx={{ ml: 1 }}
                      color={insights.sentiment_analysis.overall_sentiment === 'positive' ? 'success' : 'primary'}
                    />
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Keywords */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                Key Terms & Phrases
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {insights.keywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword.word}
                    size="small"
                    variant={keyword.relevance > 0.8 ? 'filled' : 'outlined'}
                    color={
                      keyword.relevance > 0.9 ? 'primary' :
                      keyword.relevance > 0.8 ? 'secondary' : 'default'
                    }
                  />
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Top Topics
              </Typography>
              <List dense>
                {insights.topic_modeling.main_topics.map((topic, index) => (
                  <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                    <ListItemText 
                      primary={topic.name} 
                      secondary={`Relevance: ${Math.round(topic.relevance * 100)}%`}
                    />
                    <LinearProgress 
                      variant="determinate" 
                      value={topic.relevance * 100} 
                      sx={{ width: 100, ml: 2 }}
                      color={
                        topic.relevance > 0.8 ? 'success' :
                        topic.relevance > 0.6 ? 'primary' :
                        topic.relevance > 0.4 ? 'secondary' : 'inherit'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Topic Distribution */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AutoGraphIcon sx={{ mr: 1, fontSize: 20 }} />
                Topic Distribution
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {Object.entries(insights.topic_modeling.topic_distribution).map(([topic, value], index) => (
                  <Box key={index} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{topic}</Typography>
                      <Typography variant="body2" color="text.secondary">{value}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={value} 
                      color={
                        index % 4 === 0 ? 'primary' :
                        index % 4 === 1 ? 'secondary' :
                        index % 4 === 2 ? 'success' : 'info'
                      }
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tags */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Document Tags
              </Typography>
              
              <DocumentTags documentId={documentId} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DocumentInsights; 