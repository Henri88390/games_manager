import { Request, Response } from "express";
import { GameService, gameService } from "../services/GameService";

export class PublicGameController {
  private gameService: GameService;

  constructor(service: GameService = gameService) {
    this.gameService = service;
  }

  getPopularGames = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.gameService.getPopularGames(page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching popular games:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching popular games" });
    }
  };

  getRecentGames = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.gameService.getRecentGames(page, limit);
      res.json(result);
    } catch (error) {
      console.error("Error fetching recent games:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching recent games" });
    }
  };

  searchGamesByTitle = async (req: Request, res: Response): Promise<void> => {
    try {
      const title = (req.query.title as string) || "";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.gameService.searchGamesByTitle(
        title,
        page,
        limit
      );
      res.json(result);
    } catch (error) {
      console.error("Error searching games by title:", error);
      res
        .status(500)
        .json({ error: "An error occurred while searching games" });
    }
  };

  searchGamesByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = (req.query.email as string) || "";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.gameService.searchGamesByUser(
        email,
        page,
        limit
      );
      res.json(result);
    } catch (error) {
      console.error("Error searching games by user:", error);
      res
        .status(500)
        .json({ error: "An error occurred while searching games by user" });
    }
  };

  getGlobalStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.gameService.getGlobalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching global stats:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching global statistics" });
    }
  };
}

export const publicGameController = new PublicGameController();
