import { useQuery } from "@tanstack/react-query";
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
  // User stats query with proper error handling
  const {
    data: gameStatsData,
    error: errorStats,
    isLoading: userStatsLoading,
  } = useQuery({
    queryKey: ["games", "stats", "user", userEmail],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3000/api/games/stats?email=${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user stats: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });

  // Global stats query
  const {
    data: globalStats,
    error: errorGlobalStats,
    isLoading: globalStatsLoading,
  } = useQuery({
    queryKey: ["games", "stats", "global"],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3000/api/games/public/stats`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch global stats: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes (global stats change less frequently)
    retry: 2,
  });

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
          <Toast
            message={"Unable to load user statistics."}
            visible={!!errorStats}
          />
        )}
        {errorGlobalStats && (
          <Toast
            message={"Unable to load global statistics."}
            visible={!!errorGlobalStats}
          />
        )}
        {(userStatsLoading || globalStatsLoading) && (
          <div
            style={{ textAlign: "center", margin: "1rem 0", color: "#8a5be0" }}
          >
            Loading statistics...
          </div>
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
              <td>
                {errorStats ? 0 : gameStatsData ? gameStatsData.totalGames : ""}
              </td>
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
              <td>
                {errorStats ? 0 : gameStatsData ? gameStatsData.totalTime : ""}
              </td>
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
                  : gameStatsData
                  ? gameStatsData.avgRating.toFixed(2)
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
                  : gameStatsData
                  ? gameStatsData.avgTime.toFixed(2)
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
