import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
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
  Label as LabelIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../App';

function Navbar() {
  const { isSignedIn, isAdmin } = useAuth();
  const location = useLocation();
  
  // Common pages for all users
  const commonPages = [
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Search', path: '/search', icon: <SearchIcon /> },
    { name: 'Upload', path: '/upload', icon: <UploadIcon /> },
    { name: 'Tags', path: '/tags', icon: <LabelIcon /> },
  ];
  
  // Admin-only pages
  const adminPages = [
    { name: 'Admin', path: '/admin', icon: <DashboardIcon /> },
  ];
  
  // Determine which pages to show based on auth status
  const pages = commonPages; // Show only common pages for all users

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              AI Document Search
            </Typography>
          </Box>

          {/* Navigation buttons - centered */}
          <Box sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1 }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                startIcon={page.icon}
                sx={{ 
                  mx: 1, 
                  color: 'white', 
                  display: 'flex',
                  borderBottom: location.pathname === page.path ? '2px solid white' : 'none',
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Removed UserButton and Login button */}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;