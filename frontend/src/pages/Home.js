import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
} from '@mui/material';
import {
  Search as SearchIcon,
  Upload as UploadIcon,
  Summarize as SummarizeIcon,
} from '@mui/icons-material';
import { useAuth } from '../App';

function Home() {
  const navigate = useNavigate();
  const { isSignedIn, signIn } = useAuth();

  const features = [
    {
      title: 'Natural Language Search',
      description: 'Search through your documents using everyday language. No need to remember exact keywords or phrases.',
      icon: <SearchIcon fontSize="large" />,
    },
    {
      title: 'Document Upload',
      description: 'Upload and process multiple document types including PDF, DOCX, and TXT files.',
      icon: <UploadIcon fontSize="large" />,
    },
    {
      title: 'Smart Summarization',
      description: 'Get instant summaries of your documents, highlighting key points and important information.',
      icon: <SummarizeIcon fontSize="large" />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h2"
        component="h1"
        align="center"
        gutterBottom
        sx={{ fontWeight: 'bold', mb: 4 }}
      >
        AI Document Search Assistant
      </Typography>

      <Typography
        variant="h5"
        component="h2"
        align="center"
        color="text.secondary"
        paragraph
        sx={{ mb: 6 }}
      >
        Find, understand, and extract insights from your documents using AI-powered search
      </Typography>

      {!isSignedIn && (
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={signIn}
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={signIn}
          >
            Sign In
          </Button>
        </Box>
      )}

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item key={index} xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2">
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions>
                {isSignedIn && (
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate('/search')}
                  >
                    Try it now
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home; 