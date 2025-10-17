import { useEffect, useRef, useState } from "react";
import styles from "./Home.module.scss";

interface HomeProps {
  userEmail: string;
  onLogout: () => void;
}

export default function Home({ userEmail, onLogout }: HomeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

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
    <div className={styles.homeBackground}>
      <header className={styles.header}>
        <div className={styles.logo}>Game Management</div>
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
              <button className={styles.logout} onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className={styles.main}>
        <h1>Welcome to Game Management!</h1>
        <p>Start adding your games.</p>
      </main>
    </div>
  );
}
