import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePaginationLimit } from "../../hooks/usePaginationLimit";
import { SearchField, type Game, type UserAreaProps } from "../../types/types";
import LoginHeader from "../LoginHeader/LoginHeader";
import Pagination from "../Pagination/Pagination";
import styles from "./UserArea.module.scss";

export default function UserArea({ userEmail, onLogout }: UserAreaProps) {
  const [games, setGames] = useState<Game[]>([]);

  //pagination
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = usePaginationLimit();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", rating: 0, timeSpent: 0 });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const sortField = searchParams.get("sortField") || "title";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const searchField = searchParams.get("searchField") || "title";
  const searchValue = searchParams.get("searchValue") || "";
  const [pendingSearchValue, setPendingSearchValue] = useState(searchValue);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const columns = [
    { key: "title", label: "Title" },
    { key: "rating", label: "Rating" },
    { key: "timeSpent", label: "Time Spent (h)" },
    { key: "dateadded", label: "Date Added" },
  ];

  const fetchGames = () => {
    setLoading(true);
    const params = new URLSearchParams({
      email: userEmail,
      searchField,
      searchValue,
      page: String(page),
      limit: String(limit),
    });
    fetch(`http://localhost:3000/api/games?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setGames(data.results || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  const triggerSearch = () => {
    setPage(1);
    const params = new URLSearchParams(searchParams);
    params.set("searchField", searchField);
    params.set("searchValue", searchInputRef.current?.value || "");
    params.set("email", userEmail);
    setSearchParams(params);
    fetchGames();
  };

  useEffect(() => {
    setPendingSearchValue(searchValue);
  }, [searchValue]);

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line
  }, [userEmail, page, searchField, searchValue]);

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setForm({ ...form, rating: value });
    if (value < 1 || value > 5) {
      setRatingError("Rating must be between 1 and 5");
    } else {
      setRatingError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    let response;
    if (editingId) {
      response = await fetch(`http://localhost:3000/api/games/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, ...form }),
      });
    } else {
      response = await fetch("http://localhost:3000/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, ...form }),
      });
    }
    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.error || "An error occurred";
      setError(errorMessage);
      setToast(errorMessage);
      setTimeout(() => setToast(""), 2000);
      setLoading(false);
      return;
    }
    setForm({ title: "", rating: 0, timeSpent: 0 });
    setEditingId(null);
    setError("");
    setToast(
      editingId ? "Game updated successfully!" : "Game added successfully!"
    );
    setTimeout(() => setToast(""), 2000);

    fetchGames();
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setToast("");
    let response;
    try {
      response = await fetch(`http://localhost:3000/api/games/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.error || "Failed to delete game";
        setToast(errorMessage);
        setTimeout(() => setToast(""), 2000);
        setLoading(false);
        return;
      }
      setToast("Game deleted successfully!");
      setTimeout(() => setToast(""), 2000);
    } catch {
      setToast("Network error while deleting game");
      setTimeout(() => setToast(""), 2000);
    }
    fetchGames();
  };

  const handleEdit = (game: Game) => {
    setForm({
      title: game.title,
      rating: game.rating,
      timeSpent: game.timespent,
    });
    setEditingId(game.id);
  };

  const getSortIcon = (field: string) => {
    if (sortField === field) {
      return sortOrder === "asc" ? (
        <span className={styles.sortIcon} aria-label="sorted ascending">
          ▼
        </span>
      ) : (
        <span className={styles.sortIcon} aria-label="sorted descending">
          ▲
        </span>
      );
    }
    return (
      <span className={styles.sortIcon} aria-label="not sorted">
        ⇅
      </span>
    );
  };

  const handleHeaderClick = (field: string) => {
    const params = new URLSearchParams(searchParams);
    if (sortField === field) {
      params.set("sortOrder", sortOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortField", field);
      params.set("sortOrder", "asc");
    }
    setSearchParams(params);
  };

  const handleSearchFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set("searchField", e.target.value);
    setSearchParams(params);
    setPendingSearchValue("");
  };

  const handleSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set("searchValue", e.target.value);
    setSearchParams(params);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.set("searchValue", "");
    setSearchParams(params);
    setPendingSearchValue("");
    setPage(1);
    fetchGames();
    if (searchInputRef.current) searchInputRef.current.value = "";
  };

  return (
    <div className={styles.userAreaBackground}>
      <LoginHeader userEmail={userEmail} onLogout={onLogout} />

      <div className={styles.bodyContainer}>
        <div className={styles.searchInputWrapper}>
          <div className={styles.searchInputGroup}>
            <input
              ref={searchInputRef}
              className={`${styles.input} ${styles.searchInput}`}
              type={
                searchField === SearchField.DateAdded
                  ? "date"
                  : searchField === SearchField.Rating ||
                    searchField === SearchField.TimeSpent
                  ? "number"
                  : "text"
              }
              placeholder={`Search by ${searchField}`}
              value={pendingSearchValue}
              onChange={handleSearchValueChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  triggerSearch();
                }
              }}
            />
            {pendingSearchValue && (
              <button
                className={styles.clearButton}
                type="button"
                onClick={handleClear}
                aria-label="Clear filter"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <line
                    x1="4"
                    y1="4"
                    x2="12"
                    y2="12"
                    stroke="#8a5be0"
                    strokeWidth="2"
                  />
                  <line
                    x1="12"
                    y1="4"
                    x2="4"
                    y2="12"
                    stroke="#8a5be0"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            )}
            <button
              className={styles.searchButton}
              type="button"
              onClick={triggerSearch}
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#8a5be0" strokeWidth="2" />
                <line
                  x1="13"
                  y1="13"
                  x2="17"
                  y2="17"
                  stroke="#8a5be0"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
          <select
            className={styles.input}
            value={searchField}
            onChange={handleSearchFieldChange}
          >
            <option value="title">Title</option>
            <option value="rating">Rating</option>
            <option value="timeSpent">Time Spent</option>
            <option value="dateadded">Date Added</option>
          </select>
        </div>

        <h2 className={styles.title}>Your Games</h2>
        {toast && <div className={styles.toast}>{toast}</div>}
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="number"
              min={0}
              max={5}
              placeholder="Rating"
              value={form.rating === 0 ? "" : form.rating}
              onChange={handleRatingChange}
              required
            />
            <span className={styles.inputError}>
              {ratingError ? ratingError : "\u00A0"}
            </span>
          </div>
          <input
            className={styles.input}
            type="number"
            min={0}
            placeholder="Time spent"
            value={form.timeSpent === 0 ? "" : form.timeSpent}
            onChange={(e) =>
              setForm({ ...form, timeSpent: Number(e.target.value) })
            }
            required
          />
          <button className={styles.button} type="submit" disabled={loading}>
            {editingId ? "Update Game" : "Add Game"}
          </button>
          {editingId && (
            <button
              className={styles.cancelButton}
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ title: "", rating: 1, timeSpent: 0 });
              }}
            >
              Cancel
            </button>
          )}
        </form>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <>
            <table className={styles.gamesTable}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={styles.sortableHeader}
                      onClick={() => handleHeaderClick(col.key)}
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      {col.label} {getSortIcon(col.key)}
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id}>
                    <td>{game.title}</td>
                    <td>{game.rating}</td>
                    <td>{game.timespent}</td>
                    <td>{new Date(game.dateadded).toLocaleDateString()}</td>
                    <td>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEdit(game)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(game.id)}
                      >
                        Delete
                      </button>
                    </td>
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
          </>
        )}
      </div>
    </div>
  );
}
