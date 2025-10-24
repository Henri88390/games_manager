import { Pool } from "pg";
import { GameRepository } from "../../../src/repositories/GameRepository";

// Create mock query function
const mockQuery = jest.fn();

// Mock the Pool class
const mockPool = {
  query: mockQuery,
} as unknown as Pool;

describe("GameRepository", () => {
  let gameRepository: GameRepository;

  beforeEach(() => {
    gameRepository = new GameRepository(mockPool);
    jest.clearAllMocks();
  });

  describe("getPopularGames", () => {
    it("should return popular games with correct pagination", async () => {
      const mockResults = {
        rows: [
          {
            id: 1,
            title: "Popular Game 1",
            rating: 9,
            timespent: 100,
            dateadded: new Date(),
            image_path: "game1.jpg",
          },
        ],
      };

      const mockCount = { rows: [{ count: "5" }] };

      mockQuery
        .mockResolvedValueOnce(mockResults)
        .mockResolvedValueOnce(mockCount);

      const result = await gameRepository.getPopularGames(1, 10);

      expect(result).toEqual({
        results: mockResults.rows,
        total: 5,
      });

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY rating DESC"),
        [10, 0]
      );
    });

    it("should handle database errors", async () => {
      mockQuery.mockRejectedValue(new Error("Database connection failed"));

      await expect(gameRepository.getPopularGames(1, 10)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("getRecentGames", () => {
    it("should return recent games ordered by date", async () => {
      const mockResults = {
        rows: [
          {
            id: 2,
            title: "Recent Game 1",
            rating: 8,
            timespent: 50,
            dateadded: new Date(),
            image_path: "game2.jpg",
          },
        ],
      };

      const mockCount = { rows: [{ count: "3" }] };

      mockQuery
        .mockResolvedValueOnce(mockResults)
        .mockResolvedValueOnce(mockCount);

      const result = await gameRepository.getRecentGames(1, 10);

      expect(result).toEqual({
        results: mockResults.rows,
        total: 3,
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY dateAdded DESC"),
        [10, 0]
      );
    });
  });

  describe("searchGamesByTitle", () => {
    it("should search games by title with case-insensitive matching", async () => {
      const mockResults = {
        rows: [
          {
            id: 3,
            title: "Mario Bros",
            rating: 9,
            timespent: 75,
            dateadded: new Date(),
            image_path: "mario.jpg",
          },
        ],
      };

      const mockCount = { rows: [{ count: "1" }] };

      mockQuery
        .mockResolvedValueOnce(mockResults)
        .mockResolvedValueOnce(mockCount);

      const result = await gameRepository.searchGamesByTitle("mario", 1, 10);

      expect(result).toEqual({
        results: mockResults.rows,
        total: 1,
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("LOWER(title) LIKE"),
        ["%mario%", 10, 0]
      );
    });
  });

  describe("searchGamesByUser", () => {
    it("should search games by user email", async () => {
      const mockResults = {
        rows: [
          {
            id: 4,
            title: "User Game",
            rating: 7,
            timespent: 30,
            email: "test@example.com",
            dateadded: new Date(),
            image_path: "user.jpg",
          },
        ],
      };

      const mockCount = { rows: [{ count: "1" }] };

      mockQuery
        .mockResolvedValueOnce(mockResults)
        .mockResolvedValueOnce(mockCount);

      const result = await gameRepository.searchGamesByUser(
        "test@example.com",
        1,
        10
      );

      expect(result).toEqual({
        results: mockResults.rows,
        total: 1,
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("LOWER(email) LIKE"),
        ["%test@example.com%", 10, 0]
      );
    });
  });

  describe("createGame", () => {
    it("should create a new game successfully", async () => {
      const gameData = {
        title: "New Game",
        rating: 8,
        timespent: 60,
        email: "user@test.com",
        image_path: "newgame.jpg",
      };

      const mockResult = {
        rows: [{ ...gameData, id: 4, dateadded: new Date() }],
      };

      mockQuery.mockResolvedValue(mockResult);

      const result = await gameRepository.createGame(gameData);

      expect(result).toEqual(mockResult.rows[0]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO games"),
        [
          gameData.title,
          gameData.rating,
          gameData.timespent,
          gameData.email,
          gameData.image_path,
        ]
      );
    });

    it("should handle creation errors", async () => {
      const gameData = {
        title: "Invalid Game",
        rating: 8,
        timespent: 60,
        email: "invalid-email",
        image_path: "game.jpg",
      };

      mockQuery.mockRejectedValue(new Error("Constraint violation"));

      await expect(gameRepository.createGame(gameData)).rejects.toThrow(
        "Constraint violation"
      );
    });
  });

  describe("updateGame", () => {
    it("should update an existing game", async () => {
      const updateData = {
        title: "Updated Game",
        rating: 9,
      };

      const mockResult = {
        rows: [
          {
            id: 1,
            title: "Updated Game",
            rating: 9,
            timespent: 100,
            email: "user@test.com",
            image_path: "game.jpg",
            dateadded: new Date(),
          },
        ],
      };

      mockQuery.mockResolvedValue(mockResult);

      const result = await gameRepository.updateGame(1, updateData);

      expect(result).toEqual(mockResult.rows[0]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE games SET"),
        expect.arrayContaining([1])
      );
    });

    it("should return null when game not found", async () => {
      const updateData = { title: "Non-existent Game" };
      const mockResult = { rows: [] };

      mockQuery.mockResolvedValue(mockResult);

      const result = await gameRepository.updateGame(999, updateData);

      expect(result).toBeNull();
    });
  });

  describe("deleteGame", () => {
    it("should delete a game successfully", async () => {
      const mockResult = { rowCount: 1 };
      mockQuery.mockResolvedValue(mockResult);

      const result = await gameRepository.deleteGame(1, "user@test.com");

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        "DELETE FROM games WHERE id = $1 AND email = $2",
        [1, "user@test.com"]
      );
    });

    it("should return false when game not found for deletion", async () => {
      const mockResult = { rowCount: 0 };
      mockQuery.mockResolvedValue(mockResult);

      const result = await gameRepository.deleteGame(999, "user@test.com");

      expect(result).toBe(false);
    });
  });

  describe("getGameById", () => {
    it("should return a game by ID", async () => {
      const mockResult = {
        rows: [
          {
            id: 1,
            title: "Test Game",
            rating: 8,
            timespent: 50,
            email: "user@test.com",
            image_path: "test.jpg",
            dateadded: new Date(),
          },
        ],
      };

      mockQuery.mockResolvedValue(mockResult);

      const result = await gameRepository.getGameById(1);

      expect(result).toEqual(mockResult.rows[0]);
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM games WHERE id = $1",
        [1]
      );
    });

    it("should return null when game not found by ID", async () => {
      const mockResult = { rows: [] };
      mockQuery.mockResolvedValue(mockResult);

      const result = await gameRepository.getGameById(999);

      expect(result).toBeNull();
    });
  });

  describe("getUserStats", () => {
    it("should return user statistics", async () => {
      const mockResult = {
        rows: [
          {
            total_games: "5",
            total_time: "250",
            avg_rating: "8.5",
            avg_time: "50",
          },
        ],
      };

      mockQuery.mockResolvedValue(mockResult);

      const result = await gameRepository.getUserStats("user@test.com");

      expect(result).toEqual({
        totalGames: 5,
        totalTime: 250,
        avgRating: 8.5,
        avgTime: 50,
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("COUNT(*) AS total_games"),
        ["user@test.com"]
      );
    });
  });

  describe("getGlobalStats", () => {
    it("should return global statistics", async () => {
      const mockResult = {
        rows: [
          {
            total_games: "100",
            total_time: "5000",
            avg_rating: "7.8",
            avg_time: "50",
          },
        ],
      };

      mockQuery.mockResolvedValue(mockResult);

      const result = await gameRepository.getGlobalStats();

      expect(result).toEqual({
        totalGames: 100,
        totalTime: 5000,
        avgRating: 7.8,
        avgTime: 50,
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("COUNT(*) AS total_games")
      );
    });
  });

  describe("getUserGames", () => {
    it("should return user games with filter", async () => {
      const mockResults = {
        rows: [
          {
            id: 1,
            title: "Test Game",
            rating: 8,
            timespent: 50,
            email: "user@test.com",
            image_path: "test.jpg",
            dateadded: new Date(),
          },
        ],
      };

      const mockCount = { rows: [{ count: "1" }] };

      mockQuery
        .mockResolvedValueOnce(mockResults)
        .mockResolvedValueOnce(mockCount);

      const filter = {
        searchField: "title",
        searchValue: "test",
      };

      const result = await gameRepository.getUserGames(
        "user@test.com",
        filter,
        1,
        10
      );

      expect(result).toEqual({
        results: mockResults.rows,
        total: 1,
      });

      expect(mockQuery).toHaveBeenCalledTimes(2);
    });
  });
});
