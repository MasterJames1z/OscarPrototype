import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import PostingPriceListPage from './pages/PostingPriceListPage';
import CreateTicketPage from './pages/CreateTicketPage';
import LoginPage from './pages/LoginPage';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter basename="/weightbridge">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<SidebarLayout />}>
                <Route index element={<PostingPriceListPage />} />
                <Route path="create-ticket" element={<CreateTicketPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
