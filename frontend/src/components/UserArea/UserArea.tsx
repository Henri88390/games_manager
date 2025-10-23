import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createGame,
  deleteGame,
  fetchUserGames,
  updateGame,
  uploadGameImage,
} from "../../api/games";
import { usePaginationLimit } from "../../hooks/usePaginationLimit";
import { SearchField, type Game, type UserAreaProps } from "../../types/types";
import DeleteConfirmModal from "../DeleteConfirmModal/DeleteConfirmModal";
import LoginHeader from "../LoginHeader/LoginHeader";
import Pagination from "../Pagination/Pagination";
import Toast from "../Toast/Toast";
import styles from "./UserArea.module.scss";

export default function UserArea({ userEmail, onLogout }: UserAreaProps) {
  const queryClient = useQueryClient();

  //pagination
  const [page, setPage] = useState(1);
  const limit = usePaginationLimit();
  const [form, setForm] = useState({ title: "", rating: 0, timeSpent: 0 });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [ratingError, setRatingError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const sortField = searchParams.get("sortField") || "title";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const searchField = searchParams.get("searchField") || "title";
  const searchValue = searchParams.get("searchValue") || "";
  const [pendingSearchValue, setPendingSearchValue] = useState(searchValue);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const columns = [
    { key: "image", label: "Image" },
    { key: "title", label: "Title" },
    { key: "rating", label: "Rating" },
    { key: "timeSpent", label: "Time Spent (h)" },
    { key: "dateAdded", label: "Date Added" },
  ];

  const { data: gamesData, isLoading } = useQuery({
    queryKey: ["games", userEmail],
    queryFn: () =>
      fetchUserGames(userEmail, searchField, searchValue, page, limit),
  });

  const games = gamesData?.results || [];
  const total = gamesData?.total || 0;

  // Mutations
  const createGameMutation = useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      // Invalidate user's private games
      queryClient.invalidateQueries({ queryKey: ["games", userEmail] });
      // Invalidate public queries that could be affected by new games
      queryClient.invalidateQueries({ queryKey: ["games", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["games", "popular"] });

      setForm({ title: "", rating: 0, timeSpent: 0 });
      setSelectedImage(null);
      setUploadedImagePath("");
      setEditingId(null);
      setError("");
      setToast("Game added successfully!");
      setToastType("success");
      setTimeout(() => setToast(""), 2000);
    },
    onError: (error: Error) => {
      setError(error.message);
      setToast(error.message);
      setToastType("error");
      setTimeout(() => setToast(""), 2000);
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: ({ id, gameData }: { id: string; gameData: any }) =>
      updateGame(id, gameData),
    onSuccess: () => {
      // Invalidate user's private games
      queryClient.invalidateQueries({ queryKey: ["games", userEmail] });
      // Invalidate public queries that could be affected by rating/data changes
      queryClient.invalidateQueries({ queryKey: ["games", "popular"] });
      queryClient.invalidateQueries({ queryKey: ["games", "recent"] });

      setForm({ title: "", rating: 0, timeSpent: 0 });
      setSelectedImage(null);
      setUploadedImagePath("");
      setEditingId(null);
      setError("");
      setToast("Game updated successfully!");
      setToastType("success");
      setTimeout(() => setToast(""), 2000);
    },
    onError: (error: Error) => {
      setError(error.message);
      setToast(error.message);
      setToastType("error");
      setTimeout(() => setToast(""), 2000);
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      deleteGame(id, email),
    onSuccess: () => {
      // Invalidate user's private games
      queryClient.invalidateQueries({ queryKey: ["games", userEmail] });
      // Invalidate public queries that could be affected by game removal
      queryClient.invalidateQueries({ queryKey: ["games", "popular"] });
      queryClient.invalidateQueries({ queryKey: ["games", "recent"] });

      setToast("Game deleted successfully!");
      setToastType("success");
      setTimeout(() => setToast(""), 2000);
    },
    onError: (error: Error) => {
      setToast(error.message);
      setToastType("error");
      setTimeout(() => setToast(""), 2000);
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: uploadGameImage,
  });

  const triggerSearch = () => {
    setPage(1);
    const params = new URLSearchParams(searchParams);
    params.set("searchField", searchField);
    params.set("searchValue", pendingSearchValue);
    params.set("email", userEmail);
    setSearchParams(params);
  };

  useEffect(() => {
    setPendingSearchValue(searchValue);
  }, [searchValue]);

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
    setError("");

    let imagePath = uploadedImagePath;

    // Upload image if selected
    if (selectedImage) {
      try {
        const uploadResult = await uploadImageMutation.mutateAsync(
          selectedImage
        );
        imagePath = uploadResult.imagePath;
        setUploadedImagePath(imagePath);
      } catch (error) {
        setError("Error uploading image");
        return;
      }
    }

    const gameData = { email: userEmail, ...form, imagePath };

    if (editingId) {
      updateGameMutation.mutate({ id: editingId, gameData });
    } else {
      createGameMutation.mutate(gameData);
    }
  };

  const handleDeleteClick = (game: Game) => {
    setGameToDelete(game);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (gameToDelete) {
      setToast("");
      deleteGameMutation.mutate({
        id: gameToDelete.id,
        email: userEmail,
      });
      setShowDeleteModal(false);
      setGameToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setGameToDelete(null);
  };

  const handleEdit = (game: Game) => {
    setForm({
      title: game.title,
      rating: game.rating,
      timeSpent: game.timespent,
    });
    setEditingId(game.id);
    setUploadedImagePath(game.image_path || "");
    setSelectedImage(null); // Reset file input
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
    params.set("searchValue", ""); // Clear search value when field changes
    setSearchParams(params);
    setPendingSearchValue("");
  };

  const handleSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingSearchValue(e.target.value);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.set("searchValue", "");
    setSearchParams(params);
    setPendingSearchValue("");
    setPage(1);
  };

  return (
    <div className={styles.userAreaBackground}>
      <LoginHeader userEmail={userEmail} onLogout={onLogout} />

      <div className={styles.bodyContainer}>
        <div className={styles.searchInputWrapper}>
          <div
            className={`${styles.searchInputGroup} ${
              searchField === SearchField.DateAdded ? styles.dateInputGroup : ""
            }`}
          >
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
            <option value="dateAdded">Date Added</option>
          </select>
        </div>

        <h2 className={styles.title}>Your Games</h2>
        {toast && <Toast message={toast} visible={!!toast} type={toastType} />}
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
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
            <div className={styles.imageInputGroup}>
              <input
                ref={fileInputRef}
                className={styles.hiddenFileInput}
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                className={styles.fileButton}
                onClick={() => fileInputRef.current?.click()}
              >
                {editingId ? "Change Image" : "Choose Image"}
              </button>
              <span className={styles.fileInputHelp}>
                {selectedImage
                  ? `Selected: ${selectedImage.name}`
                  : editingId && uploadedImagePath
                  ? `Current: ${uploadedImagePath}`
                  : "Max 5MB, JPG/PNG/GIF"}
              </span>
            </div>
          </div>
          <div className={styles.buttonRow}>
            <button
              className={styles.button}
              type="submit"
              disabled={
                createGameMutation.isPending ||
                updateGameMutation.isPending ||
                uploadImageMutation.isPending
              }
            >
              {editingId ? "Update Game" : "Add Game"}
            </button>
            {editingId && (
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ title: "", rating: 1, timeSpent: 0 });
                  setSelectedImage(null);
                  setUploadedImagePath("");
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {isLoading ? (
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
                    <td>
                      {game.image_path ? (
                        <img
                          src={`http://localhost:3000/uploads/${game.image_path}`}
                          alt={game.title}
                          className={styles.gameImage}
                        />
                      ) : (
                        <div className={styles.noImagePlaceholder}>
                          No Image
                        </div>
                      )}
                    </td>
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
                        onClick={() => handleDeleteClick(game)}
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

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          game={gameToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={deleteGameMutation.isPending}
        />
      </div>
    </div>
  );
}
