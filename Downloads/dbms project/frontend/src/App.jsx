import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PromptDetail from './pages/PromptDetail';
import CreatePrompt from './pages/CreatePrompt';
import UserProfile from './pages/UserProfile';
import SearchResults from './pages/SearchResults';

const App = () => {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prompt/:id" element={<PromptDetail />} />
          <Route path="/create" element={<CreatePrompt />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
