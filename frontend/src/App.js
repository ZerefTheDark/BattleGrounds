import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LayeringTest from './components/LayeringTest'; // Use LayeringTest to verify our fix
import { WindowManagerProvider } from './components/WindowManager';
import './App.css';
import './styles/enhanced-graphics.css';
import './styles/layering-fixes.css';

function App() {
  return (
    <div className="App">
      <WindowManagerProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<LayeringTest />} />
          </Routes>
        </HashRouter>
      </WindowManagerProvider>
    </div>
  );
}

export default App;