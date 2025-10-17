import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Game, UserAreaProps } from "../../types/types";
import LoginHeader from "../LoginHeader/LoginHeader";
import styles from "./UserArea.module.scss";

export default function UserArea({ userEmail, onLogout }: UserAreaProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", rating: 0, timeSpent: 0 });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const sortField = searchParams.get("sortField") || "title";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const columns = [
    { key: "title", label: "Title" },
    { key: "rating", label: "Rating" },
    { key: "timeSpent", label: "Time Spent (h)" },
    { key: "dateAdded", label: "Date Added" },
  ];

  useEffect(() => {
    setLoading(true);
    fetch(
      `http://localhost:3000/api/games?email=${encodeURIComponent(userEmail)}`
    )
      .then((res) => res.json())
      .then((data) => setGames(data))
      .finally(() => setLoading(false));
  }, [userEmail]);

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

    fetch(
      `http://localhost:3000/api/games?email=${encodeURIComponent(userEmail)}`
    )
      .then((res) => res.json())
      .then((data) => setGames(data))
      .finally(() => setLoading(false));
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
    fetch(
      `http://localhost:3000/api/games?email=${encodeURIComponent(userEmail)}`
    )
      .then((res) => res.json())
      .then((data) => setGames(data))
      .finally(() => setLoading(false));
  };

  const handleEdit = (game: Game) => {
    setForm({
      title: game.title,
      rating: game.rating,
      timeSpent: game.timeSpent,
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

  const sortedGames = [...games].sort((a, b) => {
    let result = 0;
    if (sortField === "title") {
      result = a.title.localeCompare(b.title);
    } else if (sortField === "rating") {
      result = a.rating - b.rating;
    } else if (sortField === "timeSpent") {
      result = a.timeSpent - b.timeSpent;
    } else if (sortField === "dateAdded") {
      result =
        new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
    }
    return sortOrder === "asc" ? result : -result;
  });

  return (
    <div className={styles.userAreaBackground}>
      <LoginHeader userEmail={userEmail} onLogout={onLogout} />
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
            {sortedGames.map((game) => (
              <tr key={game.id}>
                <td>{game.title}</td>
                <td>{game.rating}</td>
                <td>{game.timeSpent}</td>
                <td>{new Date(game.dateAdded).toLocaleDateString()}</td>
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
      )}
    </div>
  );
}
