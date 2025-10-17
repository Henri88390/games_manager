import { useNavigate } from "react-router-dom";
import LoginHeader from "../../components/LoginHeader/LoginHeader";
import type { HomeProps } from "../../types/types";
import styles from "./Home.module.scss";

export default function Home({ userEmail, onLogout }: HomeProps) {
  const navigate = useNavigate();

  return (
    <div className={styles.homeBackground}>
      <LoginHeader userEmail={userEmail} onLogout={onLogout} />

      <main className={styles.main}>
        <h1>Welcome to Game Management!</h1>
        <button
          className={styles.goToUserArea}
          onClick={() => navigate("/user-area")}
        >
          Start adding your games
        </button>
      </main>
    </div>
  );
}
