export type Game = {
  id: string;
  title: string;
  rating: number;
  timespent: number;
  dateAdded: string;
};

export const SearchField = {
  Title: "title",
  Rating: "rating",
  TimeSpent: "timeSpent",
  DateAdded: "dateAdded",
} as const;

export type SearchField = (typeof SearchField)[keyof typeof SearchField];

export interface UserAreaProps {
  userEmail: string;
  onLogout: () => void;
}

export interface HomeProps {
  userEmail: string;
  onLogout: () => void;
}

export interface PublicSpaceProps {
  userEmail: string;
  onLogout: () => void;
}
