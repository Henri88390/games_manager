// API functions for public games endpoints

export interface PublicGamesResponse {
  results: any[];
  total: number;
}

export async function fetchPopularGames(
  page: number,
  limit: number
): Promise<PublicGamesResponse> {
  const response = await fetch(
    `http://localhost:3000/api/games/public/popular?page=${page}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch popular games");
  }
  return response.json();
}

export async function fetchRecentGames(
  page: number,
  limit: number
): Promise<PublicGamesResponse> {
  const response = await fetch(
    `http://localhost:3000/api/games/public/recent?page=${page}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch recent games");
  }
  return response.json();
}

export async function searchGamesByTitle(
  title: string,
  page: number,
  limit: number
): Promise<PublicGamesResponse> {
  const response = await fetch(
    `http://localhost:3000/api/games/public/search?title=${encodeURIComponent(
      title
    )}&page=${page}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Failed to search games by title");
  }
  return response.json();
}

export async function searchGamesByUser(
  email: string,
  page: number,
  limit: number
): Promise<PublicGamesResponse> {
  const response = await fetch(
    `http://localhost:3000/api/games/public/by-user?email=${encodeURIComponent(
      email
    )}&page=${page}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Failed to search games by user");
  }
  return response.json();
}
