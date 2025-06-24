// react-frontend/src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import the main App component
import reportWebVitals from './reportWebVitals'; // For performance monitoring

// Import Material-UI recommended fonts
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Get the root HTML element where the React app will be mounted.
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the React application into the root element.
// All providers (Theme, Auth, Apollo, CssBaseline) are now handled within App.tsx for better encapsulation.
root.render(
  <React.StrictMode>
    <App /> {/* The main application component, which now internally sets up all providers */}
  </React.StrictMode>
);

reportWebVitals();