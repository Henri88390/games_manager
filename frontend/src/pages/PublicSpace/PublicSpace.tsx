import { useEffect, useState } from "react";
import LoginHeader from "../../components/LoginHeader/LoginHeader";
import Pagination from "../../components/Pagination/Pagination";
import { usePaginationLimit } from "../../hooks/usePaginationLimit";
import type { Game, PublicSpaceProps } from "../../types/types";
import styles from "./PublicSpace.module.scss";

export default function PublicSpace({ userEmail, onLogout }: PublicSpaceProps) {
  const [popular, setPopular] = useState<Game[]>([]);
  const [recent, setRecent] = useState<Game[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  // Track the last title actually searched
  const [lastSearchedTitle, setLastSearchedTitle] = useState("");

  // user search state
  const [userSearchEmail, setUserSearchEmail] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<Game[]>([]);
  const [userHasSearched, setUserHasSearched] = useState(false);
  // Track the last email actually searched
  const [lastSearchedEmail, setLastSearchedEmail] = useState("");

  //pagination
  const limit = usePaginationLimit();
  const [popularPage, setPopularPage] = useState(1);
  const [popularTotal, setPopularTotal] = useState(0);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotal, setRecentTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);

  // user search pagination
  const [userSearchPage, setUserSearchPage] = useState(1);
  const [userSearchTotal, setUserSearchTotal] = useState(0);

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
      setLastSearchedTitle("");
      return;
    }

    setSearchPage(1); // Reset to first page when doing new search
    const term = searchValue.trim();
    setLastSearchedTitle(term);
    fetchSearchResults(1, term);
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

  // user search handlers
  const handleUserSearch = () => {
    const email = userSearchEmail.trim();
    if (!email) {
      setUserSearchResults([]);
      setUserHasSearched(false);
      setUserSearchTotal(0);
      setLastSearchedEmail("");
      return;
    }
    setUserSearchPage(1);
    setLastSearchedEmail(email);
    fetchUserSearchResults(1, email);
  };

  const handleUserKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUserSearch();
    }
  };

  const fetchUserSearchResults = (pageNum: number, email: string) => {
    fetch(
      `http://localhost:3000/api/games/public/by-user?email=${encodeURIComponent(
        email
      )}&page=${pageNum}&limit=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.results)) {
          setUserSearchResults(data.results);
          setUserSearchTotal(data.total ?? data.results.length);
        } else if (Array.isArray(data)) {
          setUserSearchResults(data);
          setUserSearchTotal(data.length);
        } else {
          setUserSearchResults([]);
          setUserSearchTotal(0);
        }
        setUserHasSearched(true);
      })
      .catch((error) => {
        console.error("User search failed:", error);
        setUserSearchResults([]);
        setUserSearchTotal(0);
        setUserHasSearched(true);
      });
  };

  // Effect for search pagination
  useEffect(() => {
    if (hasSearched && searchValue.trim()) {
      fetchSearchResults(searchPage, searchValue.trim());
    }
  }, [searchPage, limit]);

  // effect for user search pagination
  useEffect(() => {
    if (userHasSearched && userSearchEmail.trim()) {
      fetchUserSearchResults(userSearchPage, userSearchEmail.trim());
    }
  }, [userSearchPage, limit]);

  return (
    <div className={styles.publicSpace}>
      <LoginHeader userEmail={userEmail} onLogout={onLogout} />{" "}
      <div className={styles.bodyContainer}>
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
          {hasSearched && lastSearchedTitle === searchValue && (
            <>
              {searchResults.length > 0 ? (
                <>
                  <p>
                    Found {searchTotal} result{searchTotal !== 1 ? "s" : ""} for
                    "{lastSearchedTitle}"
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
                <p>No games found for "{lastSearchedTitle}"</p>
              )}
            </>
          )}
        </section>

        <section>
          <h2>Search Games by User Email</h2>
          <div className={styles.searchBar}>
            <input
              type="email"
              value={userSearchEmail}
              onChange={(e) => {
                setUserSearchEmail(e.target.value);
                // Do not change userHasSearched; UI will compare with lastSearchedEmail
              }}
              onKeyDown={handleUserKeyDown}
              placeholder="Type part of an email (e.g. 'demo')..."
            />
            <button onClick={handleUserSearch}>Search</button>
          </div>
          {userHasSearched && lastSearchedEmail === userSearchEmail && (
            <>
              {userSearchResults.length > 0 ? (
                <>
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
                      {userSearchResults.map((g: any) => (
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
                  {userSearchTotal > limit && (
                    <Pagination
                      page={userSearchPage}
                      limit={limit}
                      total={userSearchTotal}
                      setPage={setUserSearchPage}
                    />
                  )}
                </>
              ) : (
                <p>No games found for "{lastSearchedEmail}"</p>
              )}
            </>
          )}
        </section>

        {/* Then the two listing sections */}
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
      </div>
    </div>
  );
}
