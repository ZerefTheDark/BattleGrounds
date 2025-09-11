import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import BattleMap from './components/BattleMap';
import { WindowManagerProvider } from './components/WindowManager';
import './App.css';
import './styles/enhanced-graphics.css';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/" element={<BattleMap />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;