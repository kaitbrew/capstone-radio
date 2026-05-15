import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Login.css";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginForm.username, loginForm.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(
        registerForm.username,
        registerForm.email,
        registerForm.password,
      );
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <div className="login-card">
        <h1 className="login-title">KB Radio</h1>
        <p className="login-subtitle">Sign in to save your favorite stations</p>

        {error && <p className="login-error">{error}</p>}

        <form className="login-form" onSubmit={handleLogin}>
          <input
            className="login-input"
            type="text"
            placeholder="Username"
            value={loginForm.username}
            onChange={(e) =>
              setLoginForm({ ...loginForm, username: e.target.value })
            }
            required
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            required
          />
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="login-register-prompt">
          Don't have an account?{" "}
          <button
            className="login-register-link"
            onClick={() => setShowRegister(true)}
          >
            Register
          </button>
        </p>
      </div>

      {/* Register Modal */}
      {showRegister && (
        <div
          className="modal-overlay register-overlay"
          onClick={() => setShowRegister(false)}
        >
          <div
            className="modal register-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowRegister(false)}
            >
              ✕
            </button>
            <h2 className="modal-title">Create Account</h2>

            {error && <p className="login-error">{error}</p>}

            <form className="login-form" onSubmit={handleRegister}>
              <input
                className="login-input"
                type="text"
                placeholder="Username"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, username: e.target.value })
                }
                required
              />
              <input
                className="login-input"
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                required
              />
              <input
                className="login-input"
                type="password"
                placeholder="Password (min 6 characters)"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                required
              />
              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
