import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Home from './components/pages/Home';
import MM1 from './components/pages/MM1';
import MM2 from './components/pages/MM2';
import MM1N from './components/pages/MM1N';
import MG1 from './components/pages/MG1';
import MD1 from './components/pages/MD1';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'mm1':
        return <MM1 />;
      case 'mm2':
        return <MM2 />;
      case 'mm1n':
        return <MM1N />;
      case 'mg1':
        return <MG1 />;
      case 'md1':
        return <MD1 />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:flex">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 lg:flex-1">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;