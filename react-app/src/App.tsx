import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import routes from './config/routes';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastManager } from './context/ToastManager';
import ChatButton from './components/ChatBotRouter'; // Import ChatButton


function App() {
  const location = useLocation(); // Use useLocation hook

  const hideHeaderAndFooter = location.pathname === '/removed';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full fixed top-0 z-50">
        <Header />
      </header>
      <div className="flex-grow pt-16">
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={<route.component />}
            />
          ))}
        </Routes>
      </div>
      <Footer />
      <ChatButton /> {/* Add the ChatButton component */}
    </div>
  );
}

function AppWrapper() {
  return (
    <UserProvider>
      <BrowserRouter>
        <ThemeProvider>
          <ToastManager>
            <App />
          </ToastManager>
        </ThemeProvider>
      </BrowserRouter>
    </UserProvider>
  );
}

export default AppWrapper;
