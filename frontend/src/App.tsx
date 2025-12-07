import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import BlogView from "@/pages/BlogView";
import BlogEdit from "@/pages/BlogEdit";
import ArticlesPage from "@/pages/ArticlePage";
import LoginPage from "@/pages/Auth/Login";
import SignupPage from "@/pages/Auth/SignUp";
import { Protected } from "./components/Protected";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <div className=" bg-slate-950 min-h-screen text-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          <Navbar />

          <Routes>
            <Route path="/" element={<Navigate to="/blogs" replace />} />

            <Route path="/signin" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/blogs"
              element={
                <Protected>
                  <ArticlesPage />
                </Protected>
              }
            />

            <Route
              path="/blogs/new"
              element={
                <Protected>
                  <BlogEdit />
                </Protected>
              }
            />

            <Route
              path="/blogs/:id/edit"
              element={
                <Protected>
                  <BlogEdit />
                </Protected>
              }
            />

            <Route
              path="/blogs/:id"
              element={
                <Protected>
                  <BlogView />
                </Protected>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
