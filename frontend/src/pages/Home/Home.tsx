import GameStats from "../../components/GameStats/GameStats";
import LoginHeader from "../../components/LoginHeader/LoginHeader";
import type { HomeProps } from "../../types/types";
import styles from "./Home.module.scss";

export default function Home({ userEmail, onLogout }: HomeProps) {
  return (
    <div className={styles.homeBackground}>
      <LoginHeader userEmail={userEmail} onLogout={onLogout} />

      <GameStats userEmail={userEmail} />
    </div>
  );
}
