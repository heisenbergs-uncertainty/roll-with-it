import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import HomePage from './pages/HomePage';
import CharactersPage from './pages/CharactersPage';
import CampaignsPage from './pages/CampaignsPage';
import ContentPage from './pages/ContentPage';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex space-x-8">
                  <Link
                    to="/"
                    className="inline-flex items-center px-1 pt-1 text-lg font-semibold text-gray-900"
                  >
                    Roll With It
                  </Link>
                  <Link
                    to="/characters"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900 hover:border-gray-300"
                  >
                    Characters
                  </Link>
                  <Link
                    to="/campaigns"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900 hover:border-gray-300"
                  >
                    Campaigns
                  </Link>
                  <Link
                    to="/content"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-gray-900 hover:border-gray-300"
                  >
                    Content Library
                  </Link>
                </div>
                <div className="flex items-center">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/characters" element={<CharactersPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/content" element={<ContentPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
