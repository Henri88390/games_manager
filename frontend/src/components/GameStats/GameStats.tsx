import { useEffect, useState } from "react";
import Toast from "../Toast/Toast";
import styles from "./GameStats.module.scss";

interface GameStatsProps {
  userEmail: string;
}

const defaultImages = [
  "default-celeste.jpg",
  "default-mario.jpg",
  "default-minecraft.jpg",
  "default-stardew.jpg",
  "default-zelda.jpg",
];

export default function GameStats({ userEmail }: GameStatsProps) {
  const [userStats, setUserStats] = useState<{
    totalGames: number;
    totalTime: number;
    avgRating: number;
    avgTime: number;
  } | null>(null);
  const [globalStats, setGlobalStats] = useState<{
    totalGames: number;
    totalTime: number;
    avgRating: number;
    avgTime: number;
  } | null>(null);
  const [errorStats, setErrorStats] = useState(false);
  const [errorGlobalStats, setErrorGlobalStats] = useState(false);

  useEffect(() => {
    fetch(
      `http://localhost:3000/api/games/stats?email=${encodeURIComponent(
        userEmail
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setErrorStats(true);
        else setUserStats(data);
      })
      .catch(() => setErrorStats(true));

    fetch(`http://localhost:3000/api/games/public/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setErrorGlobalStats(true);
        else setGlobalStats(data);
      })
      .catch(() => setErrorGlobalStats(true));
  }, [userEmail]);

  return (
    <div className={styles.statsPage}>
      {/* Background with default images */}
      <div className={styles.backgroundImages}>
        {Array.from({ length: 12 }).map((_, i) => {
          const filename = defaultImages[i % defaultImages.length];
          const url = `http://localhost:3000/uploads/${filename}`;
          return (
            <div
              key={i}
              className={styles.backgroundImage}
              style={{ backgroundImage: `url(${url})` }}
            />
          );
        })}
      </div>

      {/* Foreground content */}
      <div className={styles.content}>
        <h1>Game Statistics</h1>
        {errorStats && (
          <Toast message={"Unable to load statistics."} visible={errorStats} />
        )}
        <table className={styles.statsTable}>
          <thead>
            <tr>
              <th></th>
              <th>Your Stats</th>
              <th>Global Stats</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Total Games</strong>
              </td>
              <td>{errorStats ? 0 : userStats ? userStats.totalGames : ""}</td>
              <td>
                {errorGlobalStats
                  ? 0
                  : globalStats
                  ? globalStats.totalGames
                  : ""}
              </td>
            </tr>
            <tr>
              <td>
                <strong>Total Time Played (h)</strong>
              </td>
              <td>{errorStats ? 0 : userStats ? userStats.totalTime : ""}</td>
              <td>
                {errorGlobalStats
                  ? 0
                  : globalStats
                  ? globalStats.totalTime
                  : ""}
              </td>
            </tr>
            <tr>
              <td>
                <strong>Average Rating</strong>
              </td>
              <td>
                {errorStats
                  ? "0.00"
                  : userStats
                  ? userStats.avgRating.toFixed(2)
                  : ""}
              </td>
              <td>
                {errorGlobalStats
                  ? "0.00"
                  : globalStats
                  ? globalStats.avgRating.toFixed(2)
                  : ""}
              </td>
            </tr>
            <tr>
              <td>
                <strong>Average Time Played (h)</strong>
              </td>
              <td>
                {errorStats
                  ? "0.00"
                  : userStats
                  ? userStats.avgTime.toFixed(2)
                  : ""}
              </td>
              <td>
                {errorGlobalStats
                  ? "0.00"
                  : globalStats
                  ? globalStats.avgTime.toFixed(2)
                  : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
