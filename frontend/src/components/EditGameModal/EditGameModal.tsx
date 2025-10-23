import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { updateGame, uploadGameImage } from "../../api/games";
import type { Game } from "../../types/types";
import styles from "./EditGameModal.module.scss";

interface EditGameModalProps {
  isOpen: boolean;
  game: Game | null;
  userEmail: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function EditGameModal({
  isOpen,
  game,
  userEmail,
  onClose,
  onSuccess,
  onError,
}: EditGameModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use game ID as a key to track when we need to reset form state
  const currentGameId = game?.id;
  const [lastGameId, setLastGameId] = useState<string | undefined>(undefined);

  // Initialize form state based on the game, resetting when game changes
  const initialForm = useMemo(() => {
    if (!game) return { title: "", rating: 0, timeSpent: 0 };
    return {
      title: game.title,
      rating: game.rating,
      timeSpent: game.timespent,
    };
  }, [game]);

  const [form, setForm] = useState(initialForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [ratingError, setRatingError] = useState("");

  // Reset form state when game changes (without useEffect)
  if (currentGameId !== lastGameId) {
    setForm(initialForm);
    setSelectedImage(null);
    setRatingError("");
    setLastGameId(currentGameId);
  }

  const uploadedImagePath = game?.image_path || "";

  const updateGameMutation = useMutation({
    mutationFn: ({ id, gameData }: { id: string; gameData: any }) =>
      updateGame(id, gameData),
    onSuccess: () => {
      // Invalidate user's private games
      queryClient.invalidateQueries({ queryKey: ["games", userEmail] });
      // Invalidate public queries that could be affected by rating/data changes
      queryClient.invalidateQueries({ queryKey: ["games", "popular"] });
      queryClient.invalidateQueries({ queryKey: ["games", "recent"] });

      onSuccess("Game updated successfully!");
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

    if (!game) return;

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
    updateGameMutation.mutate({ id: game.id, gameData });
  };

  const handleClose = () => {
    setForm({ title: "", rating: 0, timeSpent: 0 });
    setSelectedImage(null);
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

  if (!isOpen || !game) {
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
            Edit Game
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
                Change Image
              </button>
              <span className={styles.fileInputHelp}>
                {selectedImage
                  ? `Selected: ${selectedImage.name}`
                  : uploadedImagePath
                  ? `Current: ${uploadedImagePath.split("/").pop()}`
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
                updateGameMutation.isPending || uploadImageMutation.isPending
              }
            >
              Cancel
            </button>
            <button
              className={styles.updateButton}
              type="submit"
              disabled={
                updateGameMutation.isPending || uploadImageMutation.isPending
              }
            >
              {updateGameMutation.isPending || uploadImageMutation.isPending
                ? "Updating..."
                : "Update Game"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
