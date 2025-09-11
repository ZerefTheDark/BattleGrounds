import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
// import BattleMap from './components/BattleMap';
import { WindowManagerProvider } from './components/WindowManager';
import './App.css';
import './styles/enhanced-graphics.css';

// Simple test component to isolate the issue
const TestComponent = () => {
  return (
    <div style={{ padding: '20px', background: 'gray', color: 'white', height: '100vh' }}>
      <h1>D&D Battle Map Test</h1>
      <p>If you can see this, React is working!</p>
      <button style={{ padding: '10px', marginTop: '10px' }}>Test Button</button>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <WindowManagerProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<TestComponent />} />
          </Routes>
        </HashRouter>
      </WindowManagerProvider>
    </div>
  );
}

export default App;