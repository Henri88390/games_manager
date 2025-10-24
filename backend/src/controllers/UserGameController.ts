import { Request, Response } from "express";
import { GameService, gameService } from "../services/GameService";

export class UserGameController {
  private gameService: GameService;

  constructor(service: GameService = gameService) {
    this.gameService = service;
  }

  getUserGames = async (req: Request, res: Response): Promise<void> => {
    const email = req.query.email as string;
    if (!email) {
      res.status(400).json({ error: "Missing email parameter" });
      return;
    }

    const searchField = req.query.searchField as string;
    const searchValue = req.query.searchValue as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filter = { searchField, searchValue };
    const result = await this.gameService.getUserGames(
      email,
      filter,
      page,
      limit
    );
    res.json(result);
  };

  createGame = async (req: Request, res: Response): Promise<void> => {
    const { title, rating, timespent, email, image_path } = req.body;

    const game = await this.gameService.createGame({
      title,
      rating: Number(rating),
      timespent: Number(timespent),
      email,
      image_path,
    });

    res.status(201).json(game);
  };

  updateGame = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const userEmail = req.body.email || (req.query.email as string);

    if (!userEmail) {
      res.status(400).json({ error: "User email is required" });
      return;
    }

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid game ID" });
      return;
    }

    const { title, rating, timespent, image_path } = req.body;
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (rating !== undefined) updateData.rating = Number(rating);
    if (timespent !== undefined) updateData.timespent = Number(timespent);
    if (image_path !== undefined) updateData.image_path = image_path;

    const updatedGame = await this.gameService.updateGame(
      id,
      updateData,
      userEmail
    );
    res.json(updatedGame);
  };

  deleteGame = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const userEmail = req.body.email || (req.query.email as string);

    if (!userEmail) {
      res.status(400).json({ error: "User email is required" });
      return;
    }

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid game ID" });
      return;
    }

    await this.gameService.deleteGame(id, userEmail);
    res.status(200).json({ message: "Game deleted successfully" });
  };

  getUserStats = async (req: Request, res: Response): Promise<void> => {
    const email = req.query.email as string;
    if (!email) {
      res.status(400).json({ error: "Missing email parameter" });
      return;
    }

    const stats = await this.gameService.getUserStats(email);
    res.json(stats);
  };

  getGameById = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    const userEmail = req.query.email as string;

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid game ID" });
      return;
    }

    const game = await this.gameService.getGameById(id, userEmail);
    res.json(game);
  };

  uploadImage = async (req: any, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }
    const imagePath = req.file.filename;
    res.json({ imagePath });
  };
}

export const userGameController = new UserGameController();
