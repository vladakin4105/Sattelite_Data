// Auth.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { api } from "../utils/api";

const PENDING_KEY = "pending_coords";
const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{5,}$/;

export default function Auth() {
  const { user, setUsername, setGuest } = useContext(UserContext);
  const navigate = useNavigate();

  const [nameInput, setNameInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setNameInput(e.target.value);
    setError("");
  };

  const handlePwdChange = (e) => {
    setPassword(e.target.value);
    setError("");
  };

  const validateInputs = (username, pwd) => {
    if (!username) return "Introdu un nume de utilizator.";
    if (username.length > 30) return "Numele are maxim 30 de caractere.";
    if (username.toLowerCase() === "guest") return "Numele 'guest' este rezervat.";
    if (!pwd) return "Introdu o parolă.";
    if (!pwdRegex.test(pwd))
      return "Parola trebuie să aibă minim 5 caractere, o literă mare, o literă mică și un caracter special.";
    return null;
  };

  const createUserOnServer = async (username, pwd) => {
    return api.post("/signup", { username, password: pwd });
  };

  const signInOnServer = async (username, pwd) => {
    return api.post("/signin", { username, password: pwd });
  };

  const flushPendingCoordsToServer = async (username) => {
    if (!username || username === "guest") return;
    let pending = [];
    try {
      pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
      sessionStorage.removeItem(PENDING_KEY);
    } catch {
      pending = [];
    }

    for (const p of pending) {
      try {
        await api.post(`/users/${username}/coords`, p);
      } catch (err) {
        console.warn("Failed to flush pending coord", p, err);
        try {
          const cur = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
          cur.push(p);
          sessionStorage.setItem(PENDING_KEY, JSON.stringify(cur));
        } catch {
          console.warn("Could not restore pending coord to sessionStorage");
        }
      }
    }
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    const username = nameInput.trim();
    const err = validateInputs(username, password);
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await createUserOnServer(username, password);
      setUsername(username);
      await flushPendingCoordsToServer(username);
      setNameInput("");
      setPassword("");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || "Eroare la server.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e?.preventDefault();
    const username = nameInput.trim();
    if (!username) return setError("Introdu un nume de utilizator.");
    if (!password) return setError("Introdu o parolă.");

    setLoading(true);
    setError("");
    try {
      await signInOnServer(username, password);
      setUsername(username);
      await flushPendingCoordsToServer(username);
      setNameInput("");
      setPassword("");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || "Eroare la autentificare.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    setGuest();
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom right, #59a9feff, #e3ffcbff)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(to bottom right, #d0e7fcfe, #e4fbf5ff)",
          WebkitBoxShadow: "0px 0px 25px rgba(0,0,0,0.7)",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0px 6px 18px rgba(0,0,0,0.2)",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: "1.5rem",
            textAlign: "center",
            fontSize: "2rem",
            color: "#2c3e50",
          }}
        >
          Authentication
        </h2>

        <form style={{ display: "grid", gap: "1rem" }}>
          <input
            value={nameInput}
            onChange={handleChange}
            placeholder="Username"
            aria-label="username"
            style={{
              padding: "0.8rem",
              fontSize: "1rem",
              borderRadius: 8,
              border: "1px solid #ccc",
              outline: "none",
              transition: "0.3s",
            }}
            disabled={loading}
          />

          <input
            value={password}
            onChange={handlePwdChange}
            placeholder="Password"
            type="password"
            aria-label="password"
            style={{
              padding: "0.8rem",
              fontSize: "1rem",
              borderRadius: 8,
              border: "1px solid #ccc",
              outline: "none",
              transition: "0.3s",
            }}
            disabled={loading}
          />

          <div style={{ display: "flex", gap: "0.8rem" }}>
            <button
              onClick={handleSignIn}
              style={{
                flex: 1,
                padding: "0.8rem",
                borderRadius: 8,
                border: "none",
                background: "#28a745",
                color: "white",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.3s",
              }}
              disabled={loading}
            >
              {loading ? "Se procesează..." : "Sign In"}
            </button>

            <button
              onClick={handleSignUp}
              style={{
                flex: 1,
                padding: "0.8rem",
                borderRadius: 8,
                border: "none",
                background: "#007bff",
                color: "white",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.3s",
              }}
              disabled={loading}
            >
              {loading ? "Se procesează..." : "Sign Up"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleGuest}
            style={{
              padding: "0.8rem",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "0.3s",
            }}
          >
            Continue as Guest
          </button>

          {error && (
            <div
              style={{
                padding: "0.8rem",
                background: "#ffecec",
                border: "1px solid #f5c2c2",
                borderRadius: 8,
                color: "#a33",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.9rem",
              color: "#555",
              textAlign: "center",
            }}
          >
            Currently logged in:{" "}
            <strong>{user?.username ?? "not set"}</strong>
          </div>
        </form>
      </div>
    </div>
  );
}
