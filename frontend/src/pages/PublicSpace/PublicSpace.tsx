import { useEffect, useState } from "react";
import LoginHeader from "../../components/LoginHeader/LoginHeader";
import Pagination from "../../components/Pagination/Pagination";
import { usePaginationLimit } from "../../hooks/usePaginationLimit";
import type { PublicSpaceProps } from "../../types/types";
import styles from "./PublicSpace.module.scss";

export default function PublicSpace({ userEmail, onLogout }: PublicSpaceProps) {
  const [popular, setPopular] = useState([]);
  const [recent, setRecent] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  //pagination
  const limit = usePaginationLimit();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(
      `http://localhost:3000/api/games/public/popular?page=${page}&limit=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        setPopular(data.results);
        setTotal(data.total);
      });
    fetch(
      `http://localhost:3000/api/games/public/recent?page=${page}&limit=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        setRecent(data.results);
        setTotal(data.total);
      });
  }, [page]);

  const handleSearch = () => {
    fetch(
      `http://localhost:3000/api/games/public/search?title=${encodeURIComponent(
        searchValue
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data.results);
        setTotal(data.total);
      });
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
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {popular.map((g: any) => (
                <tr key={g.id}>
                  <td>{g.title}</td>
                  <td>{g.rating}</td>
                  <td>{g.timespent}</td>
                  <td>
                    {g.dateadded && !isNaN(new Date(g.dateadded).getTime())
                      ? new Date(g.dateadded).toLocaleDateString()
                      : "-"}
                  </td>
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
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((g: any) => (
                <tr key={g.id}>
                  <td>{g.title}</td>
                  <td>{g.rating}</td>
                  <td>{g.timespent}</td>
                  <td>
                    {g.dateadded
                      ? new Date(g.dateadded).toLocaleDateString()
                      : "-"}
                  </td>
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
                  <td>{new Date(g.dateadded).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            limit={limit}
            total={total}
            setPage={setPage}
          />
        </section>
      </div>
    </div>
  );
}
