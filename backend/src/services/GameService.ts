import {
  Game,
  GameFilter,
  GameRepository,
  gameRepository,
  PaginatedResult,
} from "../repositories/GameRepository";

export class GameService {
  private gameRepository: GameRepository;

  constructor(repository: GameRepository = gameRepository) {
    this.gameRepository = repository;
  }

  // Public methods
  async getPopularGames(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Game>> {
    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10; // Max limit for performance

    return await this.gameRepository.getPopularGames(page, limit);
  }

  async getRecentGames(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Game>> {
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    return await this.gameRepository.getRecentGames(page, limit);
  }

  async searchGamesByTitle(
    title: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Game>> {
    if (!title?.trim()) {
      throw new Error("Title is required");
    }

    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    return await this.gameRepository.searchGamesByTitle(
      title.trim(),
      page,
      limit
    );
  }

  async searchGamesByUser(
    email: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Game>> {
    if (!email?.trim()) {
      return { results: [], total: 0 };
    }

    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    return await this.gameRepository.searchGamesByUser(
      email.trim(),
      page,
      limit
    );
  }

  async getGlobalStats() {
    return await this.gameRepository.getGlobalStats();
  }

  // User-specific methods
  async getUserGames(
    email: string,
    filter: GameFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Game>> {
    if (!email?.trim()) {
      throw new Error("Email is required");
    }

    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    return await this.gameRepository.getUserGames(
      email.trim(),
      filter,
      page,
      limit
    );
  }

  async createGame(gameData: {
    title: string;
    rating: number;
    timespent: number;
    email: string;
    image_path?: string;
  }): Promise<Game> {
    // Validate required fields
    if (!gameData.title?.trim()) {
      throw new Error("Title is required");
    }
    if (!gameData.email?.trim()) {
      throw new Error("Email is required");
    }
    if (
      typeof gameData.rating !== "number" ||
      gameData.rating < 0 ||
      gameData.rating > 10
    ) {
      throw new Error("Rating must be a number between 0 and 10");
    }
    if (typeof gameData.timespent !== "number" || gameData.timespent < 0) {
      throw new Error("Time spent must be a non-negative number");
    }

    const game = {
      title: gameData.title.trim(),
      rating: gameData.rating,
      timespent: gameData.timespent,
      email: gameData.email.trim(),
      image_path: gameData.image_path,
    };

    return await this.gameRepository.createGame(game);
  }

  async updateGame(
    id: number,
    gameData: Partial<Game>,
    userEmail: string
  ): Promise<Game> {
    if (!userEmail?.trim()) {
      throw new Error("User email is required");
    }

    // Verify the game exists and belongs to the user
    const existingGame = await this.gameRepository.getGameById(id);
    if (!existingGame) {
      throw new Error("Game not found");
    }
    if (existingGame.email !== userEmail.trim()) {
      throw new Error("Unauthorized: You can only update your own games");
    }

    // Validate updated data
    if (gameData.title !== undefined && !gameData.title?.trim()) {
      throw new Error("Title cannot be empty");
    }
    if (
      gameData.rating !== undefined &&
      (typeof gameData.rating !== "number" ||
        gameData.rating < 0 ||
        gameData.rating > 10)
    ) {
      throw new Error("Rating must be a number between 0 and 10");
    }
    if (
      gameData.timespent !== undefined &&
      (typeof gameData.timespent !== "number" || gameData.timespent < 0)
    ) {
      throw new Error("Time spent must be a non-negative number");
    }

    const updatedGame = await this.gameRepository.updateGame(id, gameData);
    if (!updatedGame) {
      throw new Error("Failed to update game");
    }

    return updatedGame;
  }

  async deleteGame(id: number, userEmail: string): Promise<void> {
    if (!userEmail?.trim()) {
      throw new Error("User email is required");
    }

    // Verify the game exists and belongs to the user
    const existingGame = await this.gameRepository.getGameById(id);
    if (!existingGame) {
      throw new Error("Game not found");
    }
    if (existingGame.email !== userEmail.trim()) {
      throw new Error("Unauthorized: You can only delete your own games");
    }

    const deleted = await this.gameRepository.deleteGame(id, userEmail.trim());
    if (!deleted) {
      throw new Error("Failed to delete game");
    }
  }

  async getUserStats(email: string) {
    if (!email?.trim()) {
      throw new Error("Email is required");
    }

    return await this.gameRepository.getUserStats(email.trim());
  }

  async getGameById(id: number, userEmail?: string): Promise<Game> {
    const game = await this.gameRepository.getGameById(id);
    if (!game) {
      throw new Error("Game not found");
    }

    // If userEmail is provided, verify ownership
    if (userEmail && game.email !== userEmail.trim()) {
      throw new Error("Unauthorized: You can only access your own games");
    }

    return game;
  }
}

export const gameService = new GameService();
