import React, { useEffect, useState, FC } from "react";
import { Button } from "@/components/ui/button";
import { articleApi, Article } from "@/api/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import BlogView from "@/pages/BlogView";
import BlogEdit from "@/pages/BlogEdit";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

const ArticleList: FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        if (isLoading) return;
        if (!isAuthenticated) {
          setArticles([]);
          return;
        }

        const data = await articleApi.getAll();
        setArticles(data);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setArticles([]);
      }
    };
    fetchArticles();
  }, [isAuthenticated, isLoading]);

  const handleCreateNew = () => {
    navigate("/blogs/new");
  };

  const handleDelete = async (id: string) => {
    try {
      await articleApi.delete(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting article:", err);
      alert("Failed to delete article");
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Articles</h2>
        <Button onClick={handleCreateNew} disabled={!isAuthenticated}>
          Create New Blog
        </Button>
      </div>

      <div className="space-y-3">
        {articles.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No articles yet. Generate one to get started!
          </p>
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{article.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {new Date(article.createdAt).toLocaleString()}
                  </p>
                  <p className="text-gray-800 mt-3 leading-relaxed">
                    {article.content}
                  </p>
                </div>
                {isAuthenticated && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                    className="ml-4"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Spinner: FC = () => (
  <div className="text-sm text-gray-500">Checking authentication...</div>
);

const ProtectedRoute: FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
};

const PublicOnlyRoute: FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return isAuthenticated ? <Navigate to="/blogs" replace /> : children;
};

const Header: FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="flex justify-between items-center mb-12">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          <Link to="/">Auto-Gen Blog</Link>
        </h1>
      </div>
      <div>
        {isLoading ? (
          <Spinner />
        ) : isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.firstName}</span>
            <Button onClick={async () => await logout()}>Logout</Button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/signin" className="text-blue-600">
              Sign In
            </Link>
            <Link to="/signup" className="text-blue-600">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

const App: FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Header />

          <Routes>
            <Route path="/" element={<Navigate to="/blogs" replace />} />

            <Route
              path="/signin"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignupPage />
                </PublicOnlyRoute>
              }
            />

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route
              path="/blogs"
              element={
                <ProtectedRoute>
                  <ArticleList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/blogs/:id"
              element={
                <ProtectedRoute>
                  <BlogView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/blogs/new"
              element={
                <ProtectedRoute>
                  <BlogEdit />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
