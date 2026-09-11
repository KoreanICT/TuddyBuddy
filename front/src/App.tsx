import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import member from './layout/Layout';
import AppRoutes from './router/AppRoutes';


const App: React.FC = () => {
  

  return (
    <Router>
        <Layout>
          <AppRoutes />
        </Layout>
    </Router>
  );
};

export default App;