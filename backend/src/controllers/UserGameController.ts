import { Request, Response } from "express";
import { GameService, gameService } from "../services/GameService";

export class UserGameController {
  private gameService: GameService;

  constructor(service: GameService = gameService) {
    this.gameService = service;
  }

  getUserGames = async (req: Request, res: Response): Promise<void> => {
    try {
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
    } catch (error) {
      console.error("Error fetching user games:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "An error occurred while fetching user games" });
      }
    }
  };

  createGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, rating, timespent, email, image_path } = req.body;

      const game = await this.gameService.createGame({
        title,
        rating: Number(rating),
        timespent: Number(timespent),
        email,
        image_path,
      });

      res.status(201).json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "An error occurred while creating the game" });
      }
    }
  };

  updateGame = async (req: Request, res: Response): Promise<void> => {
    try {
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
    } catch (error) {
      console.error("Error updating game:", error);
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes("Unauthorized")) {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res
          .status(500)
          .json({ error: "An error occurred while updating the game" });
      }
    }
  };

  deleteGame = async (req: Request, res: Response): Promise<void> => {
    try {
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
    } catch (error) {
      console.error("Error deleting game:", error);
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes("Unauthorized")) {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res
          .status(500)
          .json({ error: "An error occurred while deleting the game" });
      }
    }
  };

  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = req.query.email as string;
      if (!email) {
        res.status(400).json({ error: "Missing email parameter" });
        return;
      }

      const stats = await this.gameService.getUserStats(email);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "An error occurred while fetching user statistics" });
      }
    }
  };

  getGameById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userEmail = req.query.email as string;

      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid game ID" });
        return;
      }

      const game = await this.gameService.getGameById(id, userEmail);
      res.json(game);
    } catch (error) {
      console.error("Error fetching game by ID:", error);
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes("Unauthorized")) {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res
          .status(500)
          .json({ error: "An error occurred while fetching the game" });
      }
    }
  };

  uploadImage = async (req: any, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file provided" });
        return;
      }
      const imagePath = req.file.filename;
      res.json({ imagePath });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  };
}

export const userGameController = new UserGameController();
