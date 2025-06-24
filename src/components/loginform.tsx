// react-frontend/src/components/LoginForm.tsx

import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/Authcontext';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const JAVA_AUTH_URL = 'http://localhost:8080/api/auth/login';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(JAVA_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Login failed: ${response.status} ${response.statusText}`;
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (parseError) {
            errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const jwtToken = await response.text();
      // ADD THIS CONSOLE.LOG:
      console.log("LoginForm: Raw JWT received:", jwtToken);

      login(jwtToken);
      onLoginSuccess();
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, maxWidth: 400, margin: '50px auto' }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && (
          <Typography color="error" variant="body2" align="center">
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2, borderRadius: 1 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
        </Button>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Use 'recommender' (password: 'password123') or 'viewer' (password: 'password456')
        </Typography>
      </Box>
    </Paper>
  );
};

export default LoginForm;