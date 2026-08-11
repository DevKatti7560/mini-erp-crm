import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { user, login, loading } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please enter email and password");
      return;
    }

    const result = await login(
      form.email,
      form.password
    );

    if (result.success) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-icon">E</div>

          <div>
            <h1>Mini ERP</h1>
            <p>CRM Operations Portal</p>
          </div>
        </div>

        <div className="login-header">
          <h2>Welcome back</h2>
          <p>Sign in to continue to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="admin@minierp.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
                </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </div>

        <div className="login-demo">
          <strong>Demo Account</strong>

          <span>
            admin@minierp.com
          </span>

          <span>
            Admin@123
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;