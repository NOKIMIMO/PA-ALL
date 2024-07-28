import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import routes from './config/routes';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastManager } from './context/ToastManager';

console.log("Vites is running in mode: ", import.meta.env.MODE);
console.log("Vites is running in env prod : ", import.meta.env.PROD);
console.log("Vites is running in env dev : ", import.meta.env.DEV);

function App() {
  const location = useLocation(); // Use useLocation hook

  const hideHeaderAndFooter = location.pathname === '/removed';

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderAndFooter && (
        <header className="w-full fixed top-0 z-50">
          <Header />
        </header>
      )}
      <div className={`flex-grow ${hideHeaderAndFooter ? 'pt-0' : 'pt-16'}`}>
        <Routes>
          {routes.map((route, index) => {
            if (route.children) {
              return (
                <Route key={index} path={route.path} element={<route.component name={route.name} {...route.props} />}>
                  {route.children.map((childRoute, childIndex) => (
                    <Route key={childIndex} path={childRoute.path} element={<childRoute.component />} />
                  ))}
                </Route>
              );
            }
            return (
              <Route
                key={index}
                path={route.path}
                element={<route.component name={route.name} {...route.props} />}
              />
            );
          })}
        </Routes>
      </div>
      {!hideHeaderAndFooter && <Footer />}
    </div>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ThemeProvider>
          <ToastManager>
            <App />
          </ToastManager>
        </ThemeProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default AppWrapper;
