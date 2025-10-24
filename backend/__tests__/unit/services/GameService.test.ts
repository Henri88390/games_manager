import { GameRepository, GameService } from "../../../src";

// Mock the GameRepository
jest.mock("../../../src/repositories/GameRepository");

describe("GameService", () => {
  let gameService: GameService;
  let mockGameRepository: jest.Mocked<GameRepository>;

  beforeEach(() => {
    mockGameRepository = new GameRepository() as jest.Mocked<GameRepository>;
    gameService = new GameService(mockGameRepository);
    jest.clearAllMocks();
  });

  describe("getPopularGames", () => {
    it("should return popular games successfully", async () => {
      const mockResult = {
        results: [
          {
            id: 1,
            title: "Popular Game",
            rating: 9,
            timespent: 100,
            email: "user@test.com",
            image_path: "game.jpg",
            dateadded: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockGameRepository.getPopularGames.mockResolvedValue(mockResult);

      const result = await gameService.getPopularGames(1, 10);

      expect(result).toEqual(mockResult);
      expect(mockGameRepository.getPopularGames).toHaveBeenCalledWith(1, 10);
    });
  });

  describe("getRecentGames", () => {
    it("should return recent games successfully", async () => {
      const mockResult = {
        results: [
          {
            id: 2,
            title: "Recent Game",
            rating: 8,
            timespent: 50,
            email: "user@test.com",
            image_path: "recent.jpg",
            dateadded: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockGameRepository.getRecentGames.mockResolvedValue(mockResult);

      const result = await gameService.getRecentGames(1, 10);

      expect(result).toEqual(mockResult);
      expect(mockGameRepository.getRecentGames).toHaveBeenCalledWith(1, 10);
    });
  });

  describe("searchGamesByTitle", () => {
    it("should search games by title successfully", async () => {
      const title = "Mario";
      const mockResult = {
        results: [
          {
            id: 3,
            title: "Super Mario Bros",
            rating: 9,
            timespent: 75,
            email: "gamer@test.com",
            image_path: "mario.jpg",
            dateadded: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockGameRepository.searchGamesByTitle.mockResolvedValue(mockResult);

      const result = await gameService.searchGamesByTitle(title, 1, 10);

      expect(result).toEqual(mockResult);
      expect(mockGameRepository.searchGamesByTitle).toHaveBeenCalledWith(
        title,
        1,
        10
      );
    });

    it("should validate title parameter", async () => {
      await expect(gameService.searchGamesByTitle("", 1, 10)).rejects.toThrow(
        "Title is required"
      );
    });
  });

  describe("createGame", () => {
    it("should create a game successfully", async () => {
      const gameData = {
        title: "New Game",
        rating: 8,
        timespent: 60,
        email: "user@test.com",
        image_path: "newgame.jpg",
      };

      const createdGame = {
        id: 4,
        ...gameData,
        dateadded: new Date(),
      };

      mockGameRepository.createGame.mockResolvedValue(createdGame);

      const result = await gameService.createGame(gameData);

      expect(result).toEqual(createdGame);
      expect(mockGameRepository.createGame).toHaveBeenCalledWith(gameData);
    });

    it("should validate game data", async () => {
      const invalidGameData = {
        title: "",
        rating: -1,
        timespent: -1,
        email: "invalid-email",
        image_path: "",
      };

      await expect(gameService.createGame(invalidGameData)).rejects.toThrow(
        "Title is required"
      );
    });

    it("should validate rating range", async () => {
      const gameData = {
        title: "Valid Game",
        rating: 11,
        timespent: 60,
        email: "user@test.com",
        image_path: "game.jpg",
      };

      await expect(gameService.createGame(gameData)).rejects.toThrow(
        "Rating must be a number between 0 and 10"
      );
    });
  });

  describe("updateGame", () => {
    it("should update a game successfully", async () => {
      const gameId = 1;
      const updateData = {
        title: "Updated Game",
        rating: 9,
      };
      const userEmail = "user@test.com";

      const existingGame = {
        id: gameId,
        title: "Original Game",
        rating: 8,
        timespent: 60,
        email: userEmail,
        image_path: "game.jpg",
        dateadded: new Date(),
      };

      const updatedGame = {
        ...existingGame,
        ...updateData,
      };

      mockGameRepository.getGameById.mockResolvedValue(existingGame);
      mockGameRepository.updateGame.mockResolvedValue(updatedGame);

      const result = await gameService.updateGame(
        gameId,
        updateData,
        userEmail
      );

      expect(result).toEqual(updatedGame);
      expect(mockGameRepository.getGameById).toHaveBeenCalledWith(gameId);
      expect(mockGameRepository.updateGame).toHaveBeenCalledWith(
        gameId,
        updateData
      );
    });

    it("should throw error when user is not owner", async () => {
      const gameId = 1;
      const updateData = { title: "Updated Game" };
      const userEmail = "user@test.com";

      const existingGame = {
        id: gameId,
        title: "Original Game",
        rating: 8,
        timespent: 60,
        email: "other@test.com",
        image_path: "game.jpg",
        dateadded: new Date(),
      };

      mockGameRepository.getGameById.mockResolvedValue(existingGame);

      await expect(
        gameService.updateGame(gameId, updateData, userEmail)
      ).rejects.toThrow("Unauthorized: You can only update your own games");
    });

    it("should validate update data", async () => {
      const gameId = 1;
      const invalidUpdateData = {
        rating: 15, // Invalid rating
      };
      const userEmail = "user@test.com";

      // Mock the existing game so the method gets past the ownership check
      const existingGame = {
        id: gameId,
        title: "Existing Game",
        rating: 8,
        timespent: 60,
        email: userEmail,
        image_path: "game.jpg",
        dateadded: new Date(),
      };

      mockGameRepository.getGameById.mockResolvedValue(existingGame);

      await expect(
        gameService.updateGame(gameId, invalidUpdateData, userEmail)
      ).rejects.toThrow("Rating must be a number between 0 and 10");
    });
  });

  describe("deleteGame", () => {
    it("should delete a game successfully", async () => {
      const gameId = 1;
      const userEmail = "user@test.com";

      const existingGame = {
        id: gameId,
        title: "Game to Delete",
        rating: 8,
        timespent: 60,
        email: userEmail,
        image_path: "game.jpg",
        dateadded: new Date(),
      };

      mockGameRepository.getGameById.mockResolvedValue(existingGame);
      mockGameRepository.deleteGame.mockResolvedValue(true);

      await expect(
        gameService.deleteGame(gameId, userEmail)
      ).resolves.not.toThrow();

      expect(mockGameRepository.getGameById).toHaveBeenCalledWith(gameId);
      expect(mockGameRepository.deleteGame).toHaveBeenCalledWith(
        gameId,
        userEmail
      );
    });

    it("should throw error when user is not owner", async () => {
      const gameId = 1;
      const userEmail = "user@test.com";

      const existingGame = {
        id: gameId,
        title: "Game to Delete",
        rating: 8,
        timespent: 60,
        email: "other@test.com",
        image_path: "game.jpg",
        dateadded: new Date(),
      };

      mockGameRepository.getGameById.mockResolvedValue(existingGame);

      await expect(gameService.deleteGame(gameId, userEmail)).rejects.toThrow(
        "Unauthorized: You can only delete your own games"
      );
    });
  });

  describe("getUserStats", () => {
    it("should return user statistics", async () => {
      const userEmail = "user@test.com";
      const mockStats = {
        totalGames: 5,
        totalTime: 250,
        avgRating: 8.5,
        avgTime: 50,
      };

      mockGameRepository.getUserStats.mockResolvedValue(mockStats);

      const result = await gameService.getUserStats(userEmail);

      expect(result).toEqual(mockStats);
      expect(mockGameRepository.getUserStats).toHaveBeenCalledWith(userEmail);
    });
  });

  describe("getGlobalStats", () => {
    it("should return global statistics", async () => {
      const mockStats = {
        totalGames: 100,
        totalTime: 5000,
        avgRating: 7.8,
        avgTime: 50,
      };

      mockGameRepository.getGlobalStats.mockResolvedValue(mockStats);

      const result = await gameService.getGlobalStats();

      expect(result).toEqual(mockStats);
      expect(mockGameRepository.getGlobalStats).toHaveBeenCalled();
    });
  });
});
