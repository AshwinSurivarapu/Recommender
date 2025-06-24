// react-frontend/src/components/RecommendationForm.tsx

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { GENERATE_RECOMMENDATIONS } from '../graphql/mutations';
import { Item } from '../types/Item';
import { TextField, Button, Box, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import { useAuth } from '../contexts/Authcontext';


interface RecommendationFormProps {
  onRecommendationsGenerated: (items: Item[]) => void;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({ onRecommendationsGenerated }) => {
  const [preferences, setPreferences] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { hasRole } = useAuth();

  const [generateRecommendationsMutation, { loading }] = useMutation<{ generateRecommendations: Item[] }>(GENERATE_RECOMMENDATIONS, {
    onCompleted: (data) => {
      onRecommendationsGenerated(data.generateRecommendations);
      setErrorMessage(null);
      setPreferences('');
    },
    onError: (error) => {
      console.error("GraphQL Mutation Error:", error);
      setErrorMessage(error.message || "An unexpected error occurred during recommendation generation.");
      onRecommendationsGenerated([]);
    }
  });

  const canGenerate = hasRole('RECOMMENDER');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!canGenerate) {
      setErrorMessage("You do not have permission to generate recommendations. Please log in as a RECOMMENDER.");
      return;
    }

    if (!preferences.trim()) {
      setErrorMessage("Please enter your preferences.");
      return;
    }

    generateRecommendationsMutation({ variables: { preferences } });
  };

  return (
    <Card elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Get Recommendations
      </Typography>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Your Preferences"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="Tell us what you like (e.g., 'I enjoy sci-fi with space travel and alien encounters.')"
            disabled={!canGenerate || loading}
          />
          {errorMessage && (
            <Typography color="error" variant="body2" align="center">
              {errorMessage}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            disabled={loading || !canGenerate || !preferences.trim()}
            sx={{ mt: 2, borderRadius: 1 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Recommendations'}
          </Button>
          {!canGenerate && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Log in as a 'recommender' to generate.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecommendationForm;