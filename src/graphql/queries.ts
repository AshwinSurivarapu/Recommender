// react-frontend/src/graphql/queries.ts

import { gql } from '@apollo/client';

// GraphQL query to fetch all items.
export const GET_ITEMS = gql`
  query GetItems {
    items {
      id
      name
      category
      description
    }
  }
`;