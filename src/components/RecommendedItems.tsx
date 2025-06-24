// react-frontend/src/components/RecommendedItems.tsx

import React from 'react';
import { Item } from '../types/Item';
import {  Typography, Card, CardContent, List, ListItem, Divider } from '@mui/material';

interface RecommendedItemsProps {
  items: Item[];
}

const RecommendedItems: React.FC<RecommendedItemsProps> = ({ items }) => {
  return (
    <Card elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Your Top Recommendations
      </Typography>
      {items.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, width: '100%' }}>
                  <Typography variant="h6" component="div" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
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
          Enter your preferences above to get personalized recommendations!
        </Typography>
      )}
    </Card>
  );
};

export default RecommendedItems;