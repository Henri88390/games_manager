// API functions for games
export interface GamesResponse {
  results: any[];
  total: number;
}

export interface GameFormData {
  email: string;
  title: string;
  rating: number;
  timeSpent: number;
  imagePath?: string;
}

export async function fetchUserGames(
  email: string,
  searchField: string,
  searchValue: string,
  page: number,
  limit: number
): Promise<GamesResponse> {
  const params = new URLSearchParams({
    email,
    searchField,
    searchValue,
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(
    `http://localhost:3000/api/games?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch games");
  }
  return response.json();
}

export async function uploadGameImage(
  image: File
): Promise<{ imagePath: string }> {
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch("http://localhost:3000/api/games/upload-image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }
  return response.json();
}

export async function createGame(gameData: GameFormData): Promise<any> {
  const response = await fetch("http://localhost:3000/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gameData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create game");
  }
  return response.json();
}

export async function updateGame(
  id: string,
  gameData: GameFormData
): Promise<any> {
  const response = await fetch(`http://localhost:3000/api/games/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gameData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update game");
  }
  return response.json();
}

export async function deleteGame(id: string, email: string): Promise<any> {
  const response = await fetch(`http://localhost:3000/api/games/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete game");
  }
  return response.json();
}
