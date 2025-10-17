import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginHeader.module.scss";

interface LoginHeaderProps {
  userEmail: string;
  onLogout?: () => void;
}

export default function LoginHeader({ userEmail, onLogout }: LoginHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        avatarRef.current &&
        !avatarRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleAvatarClick = () => {
    setMenuOpen((open) => !open);
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button
          className={styles.homeButton}
          onClick={() => navigate("/")}
          aria-label="Go Home"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 11.5L12 4L21 11.5V20A1.5 1.5 0 0 1 19.5 21.5H4.5A1.5 1.5 0 0 1 3 20V11.5Z"
              stroke="#cccccc"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <rect x="8" y="14" width="8" height="7" fill="#cccccc" />
          </svg>
        </button>
        <div className={styles.logo}>Game Management</div>
      </div>
      <div className={styles.userSection}>
        <div
          className={styles.avatar}
          ref={avatarRef}
          onClick={handleAvatarClick}
          tabIndex={0}
          aria-label="User menu"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#4a5568" />
            <circle cx="16" cy="13" r="6" fill="#f3f3f3" />
            <ellipse cx="16" cy="25" rx="8" ry="5" fill="#f3f3f3" />
          </svg>
        </div>
        {menuOpen && (
          <div className={styles.menu} ref={menuRef}>
            <div className={styles.email}>{userEmail}</div>
            {onLogout && (
              <button className={styles.logout} onClick={onLogout}>
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
