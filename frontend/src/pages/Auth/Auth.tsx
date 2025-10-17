import { useState } from "react";
import { login, signup } from "../../api/auth";
import styles from "./Auth.module.scss";

interface AuthProps {
  onLogin: (email: string) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isInvalidCreds = error === "Invalid credentials";
  const isUserExists = error === "User already exists";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await signup(email, password);
        if (res.error) setError(res.error);
        else {
          const loginRes = await login(email, password);
          if (loginRes.error) setError(loginRes.error);
          else onLogin(email);
        }
      } else {
        const res = await login(email, password);
        if (res.error) setError(res.error);
        else onLogin(email);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {mode === "login" ? "Sign In" : "Sign Up"}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          className={`${styles.input} ${
            isInvalidCreds || isUserExists ? styles.inputError : ""
          }`}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        {/* Show error under email input if relevant */}
        {isInvalidCreds && (
          <div className={styles.inputErrorMsg}>Invalid credentials</div>
        )}
        {isUserExists && (
          <div className={styles.inputErrorMsg}>User already exists</div>
        )}
        <input
          className={`${styles.input} ${
            isInvalidCreds || isUserExists ? styles.inputError : ""
          }`}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        {/* Show other errors above the button */}
        {!isInvalidCreds && !isUserExists && error && (
          <div className={styles.error}>{error}</div>
        )}
        <button
          className={`${styles.button} ${
            mode === "login" ? styles.signIn : styles.signUp
          }`}
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
        </button>
        <button
          className={styles.button}
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
          disabled={loading}
        >
          {mode === "login" ? "Create Account" : "Back to Login"}
        </button>
      </form>
    </div>
  );
}
