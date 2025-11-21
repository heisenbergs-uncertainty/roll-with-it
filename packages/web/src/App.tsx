import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navigation } from './components/layout/Navigation';
import HomePage from './pages/HomePage';
import CharactersPage from './pages/CharactersPage';
import CharacterCreatePage from './pages/CharacterCreatePage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import CharacterEditPage from './pages/CharacterEditPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignCreatePage from './pages/CampaignCreatePage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import ContentPage from './pages/ContentPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

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
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route
                  path="/characters"
                  element={
                    <ProtectedRoute>
                      <CharactersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/characters/new"
                  element={
                    <ProtectedRoute>
                      <CharacterCreatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/characters/:id"
                  element={
                    <ProtectedRoute>
                      <CharacterDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/characters/:id/edit"
                  element={
                    <ProtectedRoute>
                      <CharacterEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaigns"
                  element={
                    <ProtectedRoute>
                      <CampaignsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaigns/new"
                  element={
                    <ProtectedRoute>
                      <CampaignCreatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaigns/:id"
                  element={
                    <ProtectedRoute>
                      <CampaignDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/content"
                  element={
                    <ProtectedRoute>
                      <ContentPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
