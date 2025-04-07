// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PlayerSelection from './components/PlayerSelection';
import ScoreTicker from './components/ScoreTicker';
import TeamSelection from './components/TeamSelection';

const App = () => {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<TeamSelection />} />
        <Route path="/player-selection" element={<PlayerSelection />} />
        <Route path="/score-ticker" element={<ScoreTicker />} />
      </Routes>
    </Router>
  );
};

export default App;
