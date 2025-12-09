import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PublicBlogs from "@/pages/PublicBlogs";
import PublicBlogView from "@/pages/PublicBlogView"; // <-- NEW PAGE
import ArticlePage from "@/pages/ArticlePage";
import BlogView from "@/pages/BlogView";
import BlogEdit from "@/pages/BlogEdit";

import LoginPage from "@/pages/Auth/Login";
import SignupPage from "@/pages/Auth/SignUp";
import { Protected } from "./components/Protected";
import Navbar from "./components/Navbar";
import { Toaster } from "sonner";

export default function App() {
  return (
    <Router>
      <Toaster richColors position="top-right" />
      <div className="bg-slate-950 min-h-screen text-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          <Navbar />

          <Routes>
            {/* Public home page */}
            <Route path="/" element={<PublicBlogs />} />

            {/* Public blog view (NO login required) */}
            <Route path="/publicblog/:id" element={<PublicBlogView />} />

            {/* Auth pages */}
            <Route path="/signin" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Private "My Blogs" section */}
            <Route
              path="/myblogs"
              element={
                <Protected>
                  <ArticlePage />
                </Protected>
              }
            />

            <Route
              path="/myblogs/new"
              element={
                <Protected>
                  <BlogEdit />
                </Protected>
              }
            />

            <Route
              path="/myblogs/:id/edit"
              element={
                <Protected>
                  <BlogEdit />
                </Protected>
              }
            />

            {/* Personal blog */}
            <Route path="/blogs/:id" element={<BlogView />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
