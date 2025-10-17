import { useEffect, useState } from "react";
import LoginHeader from "../../components/LoginHeader/LoginHeader";
import type { PublicSpaceProps } from "../../types/types";
import styles from "./PublicSpace.module.scss";

export default function PublicSpace({ userEmail, onLogout }: PublicSpaceProps) {
  const [popular, setPopular] = useState([]);
  const [recent, setRecent] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/games/public/popular")
      .then((res) => res.json())
      .then(setPopular);
    fetch("http://localhost:3000/api/games/public/recent")
      .then((res) => res.json())
      .then(setRecent);
  }, []);

  const handleSearch = () => {
    fetch(
      `http://localhost:3000/api/games/public/search?title=${encodeURIComponent(
        searchValue
      )}`
    )
      .then((res) => res.json())
      .then(setSearchResults);
  };

  return (
    <div className={styles.publicSpace}>
      <LoginHeader userEmail={userEmail} onLogout={onLogout} />{" "}
      <div className={styles.bodyContainer}>
        <h1>Public Space</h1>
        <section>
          <h2>Most Popular Games</h2>
          <table className={styles.gamesTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Rating</th>
                <th>Time Played (h)</th>
              </tr>
            </thead>
            <tbody>
              {popular.map((g: any) => (
                <tr key={g.id}>
                  <td>{g.title}</td>
                  <td>{g.rating}</td>
                  <td>{g.timespent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h2>Recently Added Games</h2>
          <table className={styles.gamesTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Rating</th>
                <th>Time Played (h)</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((g: any) => (
                <tr key={g.id}>
                  <td>{g.title}</td>
                  <td>{g.rating}</td>
                  <td>{g.timespent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h2>Search Games by Title</h2>
          <div className={styles.searchBar}>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search games..."
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          <table className={styles.searchResultsTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Rating</th>
                <th>Time Played (h)</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((g: any) => (
                <tr key={g.id}>
                  <td>{g.title}</td>
                  <td>{g.rating}</td>
                  <td>{g.timespent}</td>
                  <td>{new Date(g.dateAdded).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
