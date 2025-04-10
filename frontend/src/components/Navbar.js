import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  Search as SearchIcon,
  Upload as UploadIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth, UserButton } from '../App';

function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          AI Document Search
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isSignedIn && (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/search"
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/upload"
                startIcon={<UploadIcon />}
              >
                Upload
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/admin"
                startIcon={<DashboardIcon />}
              >
                Admin
              </Button>
            </>
          )}
          <UserButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 