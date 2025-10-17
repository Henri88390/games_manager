export type Game = {
  id: string;
  title: string;
  rating: number;
  timeSpent: number;
  dateAdded: string;
};

export enum SearchField {
  Title = "title",
  Rating = "rating",
  TimeSpent = "timeSpent",
  DateAdded = "dateAdded",
}
