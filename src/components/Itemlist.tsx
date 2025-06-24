// react-frontend/src/components/ItemList.tsx

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ITEMS } from '../graphql/queries';
import { Item } from '../types/Item';
import { Box, Typography, CircularProgress, Card, CardContent, List, ListItem, Divider } from '@mui/material';

const ItemList: React.FC = () => {
  const { loading, error, data } = useQuery<{ items: Item[] }>(GET_ITEMS);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Items...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        <Typography variant="h6">Error loading items: {error.message}</Typography>
        <Typography variant="body2">Please ensure the Java Backend is running and you are authenticated.</Typography>
      </Box>
    );
  }

  const items = data?.items || [];

  return (
    <Card elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Available Items
      </Typography>
      {items.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, width: '100%' }}>
                  <Typography variant="h6" component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {item.category}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {item.description}
                  </Typography>
                </CardContent>
              </ListItem>
              {index < items.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body1" align="center" sx={{ mt: 2 }}>
          No items found or loaded from the backend.
        </Typography>
      )}
    </Card>
  );
};

export default ItemList;