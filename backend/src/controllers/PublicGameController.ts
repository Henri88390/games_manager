import { Request, Response } from "express";
import { GameService, gameService } from "../services/GameService";

export class PublicGameController {
  private gameService: GameService;

  constructor(service: GameService = gameService) {
    this.gameService = service;
  }

  getPopularGames = async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = (req as any).pagination || { page: 1, limit: 10 };
    const result = await this.gameService.getPopularGames(page, limit);
    res.json(result);
  };

  getRecentGames = async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = (req as any).pagination || { page: 1, limit: 10 };
    const result = await this.gameService.getRecentGames(page, limit);
    res.json(result);
  };

  searchGamesByTitle = async (req: Request, res: Response): Promise<void> => {
    const title = (req as any).searchTitle || (req.query.title as string);
    const { page, limit } = (req as any).pagination || { page: 1, limit: 10 };
    const result = await this.gameService.searchGamesByTitle(
      title,
      page,
      limit
    );
    res.json(result);
  };

  searchGamesByUser = async (req: Request, res: Response): Promise<void> => {
    const email = (req as any).searchEmail || (req.query.email as string);
    const { page, limit } = (req as any).pagination || { page: 1, limit: 10 };
    const result = await this.gameService.searchGamesByUser(email, page, limit);
    res.json(result);
  };

  getGlobalStats = async (req: Request, res: Response): Promise<void> => {
    const stats = await this.gameService.getGlobalStats();
    res.json(stats);
  };
}

export const publicGameController = new PublicGameController();
