import React from 'react';
import { Navigate } from 'react-router-dom';

export const Landing = () => {
  return <Navigate to="/auth" replace />;
};