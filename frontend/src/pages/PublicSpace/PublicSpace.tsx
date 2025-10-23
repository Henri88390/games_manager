import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  fetchPopularGames,
  fetchRecentGames,
  searchGamesByTitle,
  searchGamesByUser,
} from "../../api/publicGames";
import LoginHeader from "../../components/LoginHeader/LoginHeader";
import Pagination from "../../components/Pagination/Pagination";
import { usePaginationLimit } from "../../hooks/usePaginationLimit";
import type { Game, PublicSpaceProps } from "../../types/types";
import styles from "./PublicSpace.module.scss";

export default function PublicSpace({ userEmail, onLogout }: PublicSpaceProps) {
  const [activeTab, setActiveTab] = useState<"popular" | "recent">("popular");
  const [searchType, setSearchType] = useState<"title" | "email">("title");
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  // Track the last search actually performed
  const [lastSearchedValue, setLastSearchedValue] = useState("");
  const [lastSearchedType, setLastSearchedType] = useState<"title" | "email">(
    "title"
  );

  //pagination
  const limit = usePaginationLimit();
  const [popularPage, setPopularPage] = useState(1);
  const [recentPage, setRecentPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);

  // React Query for popular games
  const { data: popularData } = useQuery({
    queryKey: ["games", "popular", popularPage, limit],
    queryFn: () => fetchPopularGames(popularPage, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const popular = popularData?.results || [];
  const popularTotal = popularData?.total || 0;

  // React Query for recent games
  const { data: recentData } = useQuery({
    queryKey: ["games", "recent", recentPage, limit],
    queryFn: () => fetchRecentGames(recentPage, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const recent = recentData?.results || [];
  const recentTotal = recentData?.total || 0;

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    setHasSearched(true);
    setLastSearchedValue(searchValue);
    setLastSearchedType(searchType);
    setSearchPage(1);

    try {
      let data;
      if (searchType === "title") {
        data = await searchGamesByTitle(searchValue, 1, limit);
      } else {
        data = await searchGamesByUser(searchValue, 1, limit);
      }
      setSearchResults(data.results);
      setSearchTotal(data.total);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSearchTotal(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const fetchSearchResults = async (pageNum: number) => {
    try {
      let data;
      if (lastSearchedType === "title") {
        data = await searchGamesByTitle(lastSearchedValue, pageNum, limit);
      } else {
        data = await searchGamesByUser(lastSearchedValue, pageNum, limit);
      }
      setSearchResults(data.results);
      setSearchTotal(data.total);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
      setSearchTotal(0);
    }
  };

  // Effect for search pagination
  useEffect(() => {
    if (hasSearched && lastSearchedValue.trim() && searchPage > 1) {
      fetchSearchResults(searchPage);
    }
  }, [searchPage, limit, lastSearchedValue, lastSearchedType]);

  return (
    <div className={styles.publicSpace}>
      <LoginHeader userEmail={userEmail} onLogout={onLogout} />{" "}
      <div className={styles.bodyContainer}>
        <section>
          <h2>Search Games</h2>
          <div className={styles.searchBar}>
            <select
              className={styles.searchTypeSelect}
              value={searchType}
              onChange={(e) =>
                setSearchType(e.target.value as "title" | "email")
              }
            >
              <option value="title">By Title</option>
              <option value="email">By User Email</option>
            </select>
            <input
              type={searchType === "email" ? "email" : "text"}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                searchType === "title"
                  ? "Search games..."
                  : "Type part of an email (e.g. 'demo')..."
              }
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          {hasSearched &&
            lastSearchedValue === searchValue &&
            lastSearchedType === searchType && (
              <>
                {searchResults.length > 0 ? (
                  <>
                    <p>
                      Found {searchTotal} result{searchTotal !== 1 ? "s" : ""}{" "}
                      for "{lastSearchedValue}" in{" "}
                      {lastSearchedType === "title" ? "titles" : "user emails"}
                    </p>
                    <table className={styles.searchResultsTable}>
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Title</th>
                          <th>Rating</th>
                          <th>Time Played (h)</th>
                          <th>Date Added</th>
                          {lastSearchedType === "email" && <th>User Email</th>}
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
                            {lastSearchedType === "email" && (
                              <td>{g.email || "-"}</td>
                            )}
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
                  <p>
                    No games found for "{lastSearchedValue}" in{" "}
                    {lastSearchedType === "title" ? "titles" : "user emails"}
                  </p>
                )}
              </>
            )}
        </section>

        {/* Tabbed section for Popular and Recent games */}
        <section>
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${
                activeTab === "popular" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("popular")}
            >
              Most Popular Games
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "recent" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("recent")}
            >
              Recently Added Games
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === "popular" && (
              <>
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
                          {g.dateadded &&
                          !isNaN(new Date(g.dateadded).getTime())
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
              </>
            )}

            {activeTab === "recent" && (
              <>
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
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
