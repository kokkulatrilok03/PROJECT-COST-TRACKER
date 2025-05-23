// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Auth from './components/Auth';
import ItemManager from './components/ItemManager';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/items" element={<ItemManager />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
