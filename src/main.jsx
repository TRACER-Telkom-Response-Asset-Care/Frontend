import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom'; // 1. Import RouterProvider
import router from './router';                       // 2. Import your router configuration
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} /> {/* 3. Use the RouterProvider */}
  </React.StrictMode>,
);