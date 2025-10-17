import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import styles from "./App.module.scss";
import UserArea from "./components/UserArea/UserArea";
import Auth from "./pages/Auth/Auth";
import Home from "./pages/Home/Home";
import PublicSpace from "./pages/PublicSpace/PublicSpace";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedLoggedIn = localStorage.getItem("loggedIn");
    if (storedLoggedIn === "true" && storedEmail) {
      setLoggedIn(true);
      setUserEmail(storedEmail);
    }
    setCheckingSession(false);
  }, []);

  const handleLogin = (email: string) => {
    setLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userEmail", email);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserEmail("");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");
  };

  if (checkingSession) {
    return <div className={styles.appBackground}>Loading...</div>;
  }

  return (
    <div className={styles.appBackground}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              !loggedIn ? (
                <Auth onLogin={handleLogin} />
              ) : (
                <Home userEmail={userEmail} onLogout={handleLogout} />
              )
            }
          />
          <Route
            path="/user-area"
            element={
              loggedIn ? (
                <UserArea userEmail={userEmail} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/public-space"
            element={
              loggedIn ? (
                <PublicSpace userEmail={userEmail} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
