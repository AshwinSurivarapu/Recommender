// react-frontend/src/types/Item.ts

// Defines the structure for an 'Item' object.
export interface Item {
  id: string;          // Unique identifier for the item
  name: string;        // Display name of the item
  category: string;    // Category of the item (e.g., "Classic Literature")
  description: string; // A textual description, used for AI recommendations
}

// Interface for a User object as understood by the client (simplified)
export interface User {
  username: string;
  roles: string[]; // e.g., ["RECOMMENDER", "VIEWER"] - roles from JWT claims
}