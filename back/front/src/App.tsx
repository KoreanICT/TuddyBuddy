import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppRoutes from './router/AppRoutes';


const App: React.FC = () => {
  

  return (
    <Router>
          <AppRoutes />
    </Router>
  );
};

export default App;