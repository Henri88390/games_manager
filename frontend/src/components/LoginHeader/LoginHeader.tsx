import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./LoginHeader.module.scss";

interface LoginHeaderProps {
  userEmail: string;
  onLogout?: () => void;
}

export default function LoginHeader({ userEmail, onLogout }: LoginHeaderProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);

  const burgerMenuRef = useRef<HTMLDivElement>(null);
  const burgerButtonRef = useRef<HTMLButtonElement>(null);

  // Avatar menu outside click
  useEffect(() => {
    if (!avatarMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(target) &&
        avatarButtonRef.current &&
        !avatarButtonRef.current.contains(target)
      ) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [avatarMenuOpen]);

  // Burger menu outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        burgerMenuRef.current &&
        !burgerMenuRef.current.contains(target) &&
        burgerButtonRef.current &&
        !burgerButtonRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleAvatarClick = () => {
    setAvatarMenuOpen((open) => !open);
  };

  return (
    <header className={styles.header}>
      <button
        ref={burgerButtonRef}
        className={styles.burgerButton}
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Open menu"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect y="6" width="28" height="3" rx="1.5" fill="#8a5be0" />
          <rect y="13" width="28" height="3" rx="1.5" fill="#8a5be0" />
          <rect y="20" width="28" height="3" rx="1.5" fill="#8a5be0" />
        </svg>
      </button>
      <div
        ref={burgerMenuRef}
        className={`${styles.menu} ${menuOpen ? styles.open : ""}`}
      >
        <Link
          to="/"
          className={`${styles.menuItem} ${
            location.pathname === "/" ? styles.active : ""
          }`}
          onClick={() => setMenuOpen(false)}
        >
          <span className={styles.menuIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 9.5L10 3L17 9.5V17C17 17.55 16.55 18 16 18H4C3.45 18 3 17.55 3 17V9.5Z"
                stroke="#8a5be0"
                strokeWidth="2"
              />
              <rect x="7" y="13" width="6" height="5" rx="1" fill="#8a5be0" />
            </svg>
          </span>
          Home
        </Link>
        <Link
          to="/user-area"
          className={`${styles.menuItem} ${
            location.pathname === "/user-area" ? styles.active : ""
          }`}
          onClick={() => setMenuOpen(false)}
        >
          <span className={styles.menuIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="4" stroke="#8a5be0" strokeWidth="2" />
              <rect
                x="4"
                y="13"
                width="12"
                height="5"
                rx="2.5"
                stroke="#8a5be0"
                strokeWidth="2"
              />
            </svg>
          </span>
          User Area
        </Link>
        <Link
          to="/public-space"
          className={`${styles.menuItem} ${
            location.pathname === "/public-space" ? styles.active : ""
          }`}
          onClick={() => setMenuOpen(false)}
        >
          <span className={styles.menuIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="#8a5be0" strokeWidth="2" />
              <path
                d="M2 10h16M10 2a8 8 0 0 1 0 16"
                stroke="#8a5be0"
                strokeWidth="2"
              />
            </svg>
          </span>
          Public Space
        </Link>
      </div>
      <div className={styles.userInfo}>
        <button
          ref={avatarButtonRef}
          className={styles.avatarButton}
          onClick={() => handleAvatarClick()}
          aria-label="Open user menu"
        >
          <span className={styles.avatar}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="12" r="7" fill="#8a5be0" />
              <rect x="6" y="22" width="20" height="8" rx="4" fill="#8a5be0" />
            </svg>
          </span>
        </button>
        <div
          ref={avatarMenuRef}
          className={`${styles.menu} ${avatarMenuOpen ? styles.open : ""}`}
          style={{ right: 0, left: "auto", top: "3.2rem" }}
        >
          <div
            className={styles.menuItem}
            style={{ cursor: "default", fontWeight: 600 }}
          >
            <span className={styles.menuIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="4" stroke="#8a5be0" strokeWidth="2" />
                <rect
                  x="4"
                  y="13"
                  width="12"
                  height="5"
                  rx="2.5"
                  stroke="#8a5be0"
                  strokeWidth="2"
                />
              </svg>
            </span>
            {userEmail}
          </div>
          <button
            className={styles.logoutButton}
            onClick={() => {
              setAvatarMenuOpen(false);
              onLogout?.();
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
