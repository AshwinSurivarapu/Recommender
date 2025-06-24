// react-frontend/src/App.tsx

import React, { JSX, useState } from 'react';
import './App.css'; // Minimal global styles
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  ThemeProvider, createTheme, CssBaseline
} from '@mui/material';

// ALL NECESSARY IMPORTS FOR APP.TSX
import RecommendationForm from './components/RecommendationForm';
import RecommendedItems from './components/RecommendedItems';
import { Item } from './types/Item';

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, concat, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import ItemList from './components/Itemlist';
import LoginForm from './components/loginform';
import { useAuth, AuthProvider } from './contexts/Authcontext';


// --- 1. Material-UI Theme Definition ---
const theme = createTheme({
  palette: {
    primary: { main: '#282c34' },
    secondary: { main: '#007bff' },
    background: { default: '#e0e0e0', paper: '#f8f8f8' },
    error: { main: '#dc3545' }
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '1.8rem', fontWeight: 600 },
    h5: { fontSize: '1.5rem', fontWeight: 500 },
    h6: { fontSize: '1.2rem', fontWeight: 500 },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, textTransform: 'none', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
          transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)' },
          '&.Mui-disabled': { backgroundColor: '#cccccc', color: '#666666', boxShadow: 'none', transform: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 10, boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginBottom: '25px' } },
    },
    MuiTextField: {
      styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } },
    },
    MuiAppBar: {
      styleOverrides: { root: { borderRadius: '0 0 12px 12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' } },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
  },
});

// --- 2. Apollo Client Setup ---
const createApolloClient = () => {
  const httpLink = new HttpLink({ uri: 'http://localhost:8080/graphql' });
  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('jwtToken');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      }
    };
  });
  return new ApolloClient({
    link: concat(authLink, httpLink),
    cache: new InMemoryCache(),
  });
};

// --- 3. PrivateRoute Component ---
// Note: This PrivateRoute is still useful for nested protected components or specific role checks,
// but the top-level authentication gate in AppContent is the primary redirector now.
interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasRole } = useAuth(); // isAuthenticated will always be true here if reached via AppContent gate

  // This check here is redundant if AppContent already handles the primary unauthenticated redirect.
  // However, it acts as a fallback and handles granular role checks.
  if (!isAuthenticated) {
    // This case should ideally not be hit if AppContent's top-level gate works.
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => hasRole(role))) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Access Denied!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You do not have the necessary permissions to view this content.
        </Typography>
        <Button variant="contained" onClick={() => window.history.back()} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }
  return children;
};

// --- 4. Main Application Content Component (`AppContent`) ---
const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [recommendedItems, setRecommendedItems] = useState<Item[]>([]);

  const handleLogout = () => {
    logout();
    setRecommendedItems([]);
  };

  // NEW: Top-level authentication check
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AI Recommendation System
            </Typography>
            <Button color="inherit" href="/login" sx={{ fontWeight: 'bold' }}>
              Login
            </Button>
          </Toolbar>
        </AppBar>
        <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Routes>
            {/* Render LoginForm for /login route, and also as default for any other path if not authenticated */}
            <Route path="/login" element={<LoginForm onLoginSuccess={() => window.location.href = '/'} />} />
            <Route path="*" element={<Navigate to="/login" replace />} /> {/* Redirect any other path to login */}
          </Routes>
        </Container>
      </Box>
    );
  }

  // If authenticated, render the main application layout and routes
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Recommendation System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2, color: 'white' }}>
              Welcome, {user?.username} ({user?.roles.join(', ') || 'No Roles'})
            </Typography>
            <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 'bold' }}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 4 }}>
        <Routes>
          {/* Authenticated user always redirects from /login to / */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          {/* Main protected route */}
          <Route
            path="/"
            element={
              // PrivateRoute is now used primarily for *role-based* access within authenticated state
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <PrivateRoute allowedRoles={['VIEWER', 'RECOMMENDER']}>
                  <ItemList />
                </PrivateRoute>
                <PrivateRoute allowedRoles={['RECOMMENDER']}>
                  <RecommendationForm onRecommendationsGenerated={setRecommendedItems} />
                </PrivateRoute>
                <RecommendedItems items={recommendedItems} />
              </Box>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Catch-all redirects to home if authenticated */}
        </Routes>
      </Container>
    </Box>
  );
};

// --- 5. Root App Component ---
function App(): JSX.Element {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ApolloClientProviderWrapper />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

const ApolloClientProviderWrapper: React.FC = () => {
  const apolloClient = React.useMemo(() => createApolloClient(), []);
  return (
    <ApolloProvider client={apolloClient}>
      <AppContent />
    </ApolloProvider>
  );
};

export default App;