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
  const [hasSearched, setHasSearched] = useState(false);

  //pagination
  const limit = usePaginationLimit();
  const [popularPage, setPopularPage] = useState(1);
  const [popularTotal, setPopularTotal] = useState(0);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotal, setRecentTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);

  useEffect(() => {
    fetch(
      `http://localhost:3000/api/games/public/popular?page=${popularPage}&limit=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        setPopular(data.results);
        setPopularTotal(data.total);
      });
  }, [popularPage, limit]);

  useEffect(() => {
    fetch(
      `http://localhost:3000/api/games/public/recent?page=${recentPage}&limit=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        setRecent(data.results);
        setRecentTotal(data.total);
      });
  }, [recentPage, limit]);

  const handleSearch = () => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchTotal(0);
      return;
    }

    setSearchPage(1); // Reset to first page when doing new search
    fetchSearchResults(1, searchValue.trim());
  };

  const fetchSearchResults = (pageNum: number, searchTerm: string) => {
    fetch(
      `http://localhost:3000/api/games/public/search?title=${encodeURIComponent(
        searchTerm
      )}&page=${pageNum}&limit=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data.results);
        setSearchTotal(data.total);
        setHasSearched(true);
      })
      .catch((error) => {
        console.error("Search failed:", error);
        setSearchResults([]);
        setSearchTotal(0);
        setHasSearched(true);
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Effect for search pagination
  useEffect(() => {
    if (hasSearched && searchValue.trim()) {
      fetchSearchResults(searchPage, searchValue.trim());
    }
  }, [searchPage, limit]);

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
                <th>Image</th>
                <th>Title</th>
                <th>Rating</th>
                <th>Time Played (h)</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {popular.map((g: any) => (
                <tr key={g.id}>
                  <td>
                    {g.image_path ? (
                      <img
                        src={`http://localhost:3000/uploads/${g.image_path}`}
                        alt={g.title}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          borderRadius: "4px",
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </td>
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
          {popularTotal > limit && (
            <Pagination
              page={popularPage}
              limit={limit}
              total={popularTotal}
              setPage={setPopularPage}
            />
          )}
        </section>
        <section>
          <h2>Recently Added Games</h2>
          <table className={styles.gamesTable}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Rating</th>
                <th>Time Played (h)</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((g: any) => (
                <tr key={g.id}>
                  <td>
                    {g.image_path ? (
                      <img
                        src={`http://localhost:3000/uploads/${g.image_path}`}
                        alt={g.title}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          borderRadius: "4px",
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </td>
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
          {recentTotal > limit && (
            <Pagination
              page={recentPage}
              limit={limit}
              total={recentTotal}
              setPage={setRecentPage}
            />
          )}
        </section>
        <section>
          <h2>Search Games by Title</h2>
          <div className={styles.searchBar}>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search games..."
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          {hasSearched && (
            <>
              {searchResults.length > 0 ? (
                <>
                  <p>
                    Found {searchTotal} result{searchTotal !== 1 ? "s" : ""} for
                    "{searchValue}"
                  </p>
                  <table className={styles.searchResultsTable}>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Rating</th>
                        <th>Time Played (h)</th>
                        <th>Date Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((g: any) => (
                        <tr key={g.id}>
                          <td>
                            {g.image_path ? (
                              <img
                                src={`http://localhost:3000/uploads/${g.image_path}`}
                                alt={g.title}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  backgroundColor: "#f0f0f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "10px",
                                  borderRadius: "4px",
                                }}
                              >
                                No Image
                              </div>
                            )}
                          </td>
                          <td>{g.title}</td>
                          <td>{g.rating}</td>
                          <td>{g.timespent}</td>
                          <td>
                            {g.dateadded &&
                            !isNaN(new Date(g.dateadded).getTime())
                              ? new Date(g.dateadded).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {searchTotal > limit && (
                    <Pagination
                      page={searchPage}
                      limit={limit}
                      total={searchTotal}
                      setPage={setSearchPage}
                    />
                  )}
                </>
              ) : (
                <p>No games found for "{searchValue}"</p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
