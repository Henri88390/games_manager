export const usePaginationLimit = () => {
  return Number(import.meta.env.VITE_PAGINATION_LIMIT) || 10;
};
