import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import BattleMapNew from './components/BattleMapNew';
import { WindowManagerProvider } from './components/WindowManager';
import './App.css';
import './styles/enhanced-graphics.css';

function App() {
  return (
    <div className="App">
      <WindowManagerProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<BattleMapNew />} />
          </Routes>
        </HashRouter>
      </WindowManagerProvider>
    </div>
  );
}

export default App;