import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import PostingPriceListPage from './pages/PostingPriceListPage';
import CreateTicketPage from './pages/CreateTicketPage';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SidebarLayout />}>
            <Route index element={<PostingPriceListPage />} />
            <Route path="create-ticket" element={<CreateTicketPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
