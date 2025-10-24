import { Request, Response } from "express";
import { GameService, PublicGameController } from "../../../src";

// Mock the GameService
jest.mock("../../../src/services/GameService");

describe("PublicGameController", () => {
  let publicGameController: PublicGameController;
  let mockGameService: jest.Mocked<GameService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockGameService = new GameService() as jest.Mocked<GameService>;
    publicGameController = new PublicGameController(mockGameService);

    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

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

      mockGameService.getPopularGames.mockResolvedValue(mockResult);
      (mockRequest as any).pagination = { page: 1, limit: 10 };

      await publicGameController.getPopularGames(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGameService.getPopularGames).toHaveBeenCalledWith(1, 10);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("should use default pagination when not provided", async () => {
      const mockResult = {
        results: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      mockGameService.getPopularGames.mockResolvedValue(mockResult);

      await publicGameController.getPopularGames(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGameService.getPopularGames).toHaveBeenCalledWith(1, 10);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
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

      mockGameService.getRecentGames.mockResolvedValue(mockResult);
      (mockRequest as any).pagination = { page: 1, limit: 10 };

      await publicGameController.getRecentGames(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGameService.getRecentGames).toHaveBeenCalledWith(1, 10);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("searchGamesByTitle", () => {
    it("should search games by title successfully", async () => {
      const mockResult = {
        results: [
          {
            id: 3,
            title: "Mario Bros",
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

      mockGameService.searchGamesByTitle.mockResolvedValue(mockResult);
      (mockRequest as any).searchTitle = "Mario";
      (mockRequest as any).pagination = { page: 1, limit: 10 };

      await publicGameController.searchGamesByTitle(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGameService.searchGamesByTitle).toHaveBeenCalledWith(
        "Mario",
        1,
        10
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("should use query parameter when searchTitle is not in request", async () => {
      const mockResult = {
        results: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      mockGameService.searchGamesByTitle.mockResolvedValue(mockResult);
      mockRequest.query = { title: "Zelda" };
      (mockRequest as any).pagination = { page: 1, limit: 10 };

      await publicGameController.searchGamesByTitle(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGameService.searchGamesByTitle).toHaveBeenCalledWith(
        "Zelda",
        1,
        10
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("searchGamesByUser", () => {
    it("should search games by user email successfully", async () => {
      const mockResult = {
        results: [
          {
            id: 4,
            title: "User Game",
            rating: 7,
            timespent: 30,
            email: "test@example.com",
            image_path: "user.jpg",
            dateadded: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockGameService.searchGamesByUser.mockResolvedValue(mockResult);
      (mockRequest as any).searchEmail = "test@example.com";
      (mockRequest as any).pagination = { page: 1, limit: 10 };

      await publicGameController.searchGamesByUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGameService.searchGamesByUser).toHaveBeenCalledWith(
        "test@example.com",
        1,
        10
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it("should use query parameter when searchEmail is not in request", async () => {
      const mockResult = {
        results: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      mockGameService.searchGamesByUser.mockResolvedValue(mockResult);
      mockRequest.query = { email: "user@test.com" };
      (mockRequest as any).pagination = { page: 1, limit: 10 };

      await publicGameController.searchGamesByUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGameService.searchGamesByUser).toHaveBeenCalledWith(
        "user@test.com",
        1,
        10
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("getGlobalStats", () => {
    it("should return global statistics successfully", async () => {
      const mockStats = {
        totalGames: 100,
        totalTime: 5000,
        avgRating: 7.8,
        avgTime: 50,
      };

      mockGameService.getGlobalStats.mockResolvedValue(mockStats);

      await publicGameController.getGlobalStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGameService.getGlobalStats).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockStats);
    });
  });
});
