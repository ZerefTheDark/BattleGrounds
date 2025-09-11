import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import BattleMap from './components/BattleMap';
import './App.css';
import './styles/enhanced-graphics.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter basename="/BattleGrounds">
        <Routes>
          <Route path="/" element={<BattleMap />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;