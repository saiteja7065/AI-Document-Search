import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  Upload as UploadIcon,
  Dashboard as DashboardIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { useAuth, UserButton } from '../App';

function Navbar() {
  const { isSignedIn } = useAuth();

  const pages = [
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Search', path: '/search', icon: <SearchIcon /> },
    { name: 'Upload', path: '/upload', icon: <UploadIcon /> },
    { name: 'Tags', path: '/tags', icon: <LabelIcon /> },
    { name: 'Admin', path: '/admin', icon: <DashboardIcon /> },
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              AI Document Search
            </Typography>

            {isSignedIn && (
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                {pages.map((page) => (
                  <Button
                    key={page.name}
                    component={RouterLink}
                    to={page.path}
                    startIcon={page.icon}
                    sx={{ my: 2, color: 'white', display: 'flex' }}
                  >
                    {page.name}
                  </Button>
                ))}
              </Box>
            )}
          </Box>

          {isSignedIn && (
            <Box sx={{ flexGrow: 0 }}>
              <UserButton />
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar; 