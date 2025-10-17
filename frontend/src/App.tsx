import { useEffect, useState } from "react";
import styles from "./App.module.scss";
import Auth from "./pages/Auth/Auth";
import Home from "./pages/Home/Home";

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
      {!loggedIn ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <Home userEmail={userEmail} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
