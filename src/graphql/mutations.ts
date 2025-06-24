// react-frontend/src/graphql/mutations.ts
// react-frontend/src/graphql/mutations.ts

import { gql } from '@apollo/client';

// GraphQL mutation to generate recommendations.
export const GENERATE_RECOMMENDATIONS = gql`
  mutation GenerateRecommendations($preferences: String!) {
    generateRecommendations(preferences: $preferences) {
      id
      name
      category
      description
    }
  }
`;

// // GraphQL mutation for user login (this will still be a REST call initially as decided,
// // but if we later migrated login to GraphQL, it would look like this)
// // For now, this is kept as a placeholder to acknowledge future potential.
// export const LOGIN_USER = gql`
//   mutation LoginUser($username: String!, $password: String!) {
//     login(username: $username, password: $password) {
//       token # Assuming the server returns a token directly
//       user {
//         username
//         roles
//       }
//     }
//   }
// `;