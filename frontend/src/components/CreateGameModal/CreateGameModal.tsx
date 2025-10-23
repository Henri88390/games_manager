import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { createGame, uploadGameImage } from "../../api/games";
import styles from "./CreateGameModal.module.scss";

interface CreateGameModalProps {
  isOpen: boolean;
  userEmail: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function CreateGameModal({
  isOpen,
  userEmail,
  onClose,
  onSuccess,
  onError,
}: CreateGameModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ title: "", rating: 0, timeSpent: 0 });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string>("");
  const [ratingError, setRatingError] = useState("");

  const createGameMutation = useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      // Invalidate user's private games
      queryClient.invalidateQueries({ queryKey: ["games", userEmail] });
      // Invalidate public queries that could be affected by new games
      queryClient.invalidateQueries({ queryKey: ["games", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["games", "popular"] });

      onSuccess("Game added successfully!");
      handleClose();
    },
    onError: (error: Error) => {
      onError(error.message);
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: uploadGameImage,
  });

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 5) {
      setRatingError("Rating cannot exceed 5");
      return;
    }
    setRatingError("");
    setForm({ ...form, rating: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.rating > 5) {
      setRatingError("Rating cannot exceed 5");
      return;
    }

    let imagePath = uploadedImagePath;

    if (selectedImage) {
      try {
        const uploadResponse = await uploadImageMutation.mutateAsync(
          selectedImage
        );
        imagePath = uploadResponse.imagePath;
      } catch (error) {
        onError("Failed to upload image");
        return;
      }
    }

    const gameData = { email: userEmail, ...form, imagePath };
    createGameMutation.mutate(gameData);
  };

  const handleClose = () => {
    setForm({ title: "", rating: 0, timeSpent: 0 });
    setSelectedImage(null);
    setUploadedImagePath("");
    setRatingError("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.modalHeader}>
          <h3 id="modal-title" className={styles.modalTitle}>
            Add New Game
          </h3>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <input
              className={styles.input}
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="number"
                min={0}
                max={5}
                placeholder="Rating (0-5)"
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
              placeholder="Time spent (hours)"
              value={form.timeSpent === 0 ? "" : form.timeSpent}
              onChange={(e) =>
                setForm({ ...form, timeSpent: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className={styles.formRow}>
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
                Choose Image
              </button>
              <span className={styles.fileInputHelp}>
                {selectedImage
                  ? `Selected: ${selectedImage.name}`
                  : "Max 5MB, JPG/PNG/GIF"}
              </span>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={handleClose}
              disabled={
                createGameMutation.isPending || uploadImageMutation.isPending
              }
            >
              Cancel
            </button>
            <button
              className={styles.addButton}
              type="submit"
              disabled={
                createGameMutation.isPending || uploadImageMutation.isPending
              }
            >
              {createGameMutation.isPending || uploadImageMutation.isPending
                ? "Adding..."
                : "Add Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
