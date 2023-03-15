import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Main from './Main';
import Search from './Search.js';

import { Routes, Route, Link } from 'react-router-dom';

function App() {

 // setting routes for components for navigation
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/main' element={<Main />} />
      <Route path='/search' element={<Search />} />
    </Routes>
  );
}

export default App;
