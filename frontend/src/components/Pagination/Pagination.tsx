import React from "react";
import styles from "./Pagination.module.scss";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  setPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  limit,
  total,
  setPage,
}) => (
  <div className={styles.pagination}>
    <button
      className={styles.paginationButton}
      disabled={page === 1}
      onClick={() => setPage(page - 1)}
      aria-label="Previous page"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M14 18L8 11L14 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
    <span className={styles.paginationPage}>Page {page}</span>
    <button
      className={styles.paginationButton}
      disabled={page * limit >= total}
      onClick={() => setPage(page + 1)}
      aria-label="Next page"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M8 4L14 11L8 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  </div>
);

export default Pagination;
