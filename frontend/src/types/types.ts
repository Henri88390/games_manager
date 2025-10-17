export type Game = {
  id: string;
  title: string;
  rating: number;
  timeSpent: number;
  dateAdded: string;
};

export interface UserAreaProps {
  userEmail: string;
  onLogout: () => void;
}

export interface HomeProps {
  userEmail: string;
  onLogout: () => void;
}
