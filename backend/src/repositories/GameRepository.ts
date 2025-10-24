import { Pool } from "pg";
import { pool } from "../db";
import { SearchField } from "../types/game";

export interface Game {
  id?: number;
  title: string;
  rating: number;
  timespent: number;
  dateadded?: Date;
  email: string;
  image_path?: string;
}

export interface PaginatedResult<T> {
  results: T[];
  total: number;
}

export interface GameFilter {
  searchField?: string;
  searchValue?: string;
  email?: string;
}

export class GameRepository {
  private pool: Pool;

  constructor(dbPool: Pool = pool) {
    this.pool = dbPool;
  }

  async getPopularGames(
    page: number,
    limit: number
  ): Promise<PaginatedResult<Game>> {
    const offset = (page - 1) * limit;

    const [result, countResult] = await Promise.all([
      this.pool.query(
        `SELECT id, title, rating, timeSpent, dateAdded, image_path
         FROM games
         ORDER BY rating DESC, timeSpent DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      this.pool.query(`SELECT COUNT(*) FROM games`),
    ]);

    return {
      results: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async getRecentGames(
    page: number,
    limit: number
  ): Promise<PaginatedResult<Game>> {
    const offset = (page - 1) * limit;

    const [result, countResult] = await Promise.all([
      this.pool.query(
        `SELECT id, title, rating, timeSpent, dateAdded, image_path
         FROM games
         ORDER BY dateAdded DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      this.pool.query(`SELECT COUNT(*) FROM games`),
    ]);

    return {
      results: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async searchGamesByTitle(
    title: string,
    page: number,
    limit: number
  ): Promise<PaginatedResult<Game>> {
    const offset = (page - 1) * limit;
    const searchTerm = `%${title.toLowerCase()}%`;

    const [result, countResult] = await Promise.all([
      this.pool.query(
        `SELECT id, title, rating, timeSpent, dateAdded, image_path
         FROM games
         WHERE LOWER(title) LIKE $1
         ORDER BY id
         LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      ),
      this.pool.query(`SELECT COUNT(*) FROM games WHERE LOWER(title) LIKE $1`, [
        searchTerm,
      ]),
    ]);

    return {
      results: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async searchGamesByUser(
    email: string,
    page: number,
    limit: number
  ): Promise<PaginatedResult<Game>> {
    const offset = (page - 1) * limit;
    const searchTerm = `%${email.toLowerCase()}%`;

    const [result, countResult] = await Promise.all([
      this.pool.query(
        `SELECT id, title, rating, timeSpent, dateAdded, image_path, email
         FROM games
         WHERE LOWER(email) LIKE $1
         ORDER BY dateAdded DESC
         LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      ),
      this.pool.query(`SELECT COUNT(*) FROM games WHERE LOWER(email) LIKE $1`, [
        searchTerm,
      ]),
    ]);

    return {
      results: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async getGlobalStats() {
    const result = await this.pool.query(
      `SELECT
        COUNT(*) AS total_games,
        COALESCE(SUM(timespent), 0) AS total_time,
        COALESCE(AVG(rating), 0) AS avg_rating,
        COALESCE(AVG(timespent), 0) AS avg_time
      FROM games;`
    );

    const stats = result.rows[0];
    return {
      totalGames: Number(stats.total_games),
      totalTime: Number(stats.total_time),
      avgRating: Number(stats.avg_rating),
      avgTime: Number(stats.avg_time),
    };
  }

  async getUserGames(
    email: string,
    filter: GameFilter,
    page: number,
    limit: number
  ): Promise<PaginatedResult<Game>> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM games WHERE email = $1";
    let countQuery = "SELECT COUNT(*) FROM games WHERE email = $1";
    const params: any[] = [email];
    const countParams: any[] = [email];

    // Add search filters
    if (filter.searchField && filter.searchValue) {
      const searchValue = filter.searchValue;
      switch (filter.searchField) {
        case SearchField.Title:
          query += " AND LOWER(title) LIKE $2";
          countQuery += " AND LOWER(title) LIKE $2";
          params.push(`%${searchValue.toLowerCase()}%`);
          countParams.push(`%${searchValue.toLowerCase()}%`);
          break;
        case SearchField.Rating:
          query += " AND rating = $2";
          countQuery += " AND rating = $2";
          params.push(Number(searchValue));
          countParams.push(Number(searchValue));
          break;
        case SearchField.TimeSpent:
          query += " AND timeSpent = $2";
          countQuery += " AND timeSpent = $2";
          params.push(Number(searchValue));
          countParams.push(Number(searchValue));
          break;
        case SearchField.DateAdded:
          query += " AND TO_CHAR(dateAdded, 'YYYY-MM-DD') = $2";
          countQuery += " AND TO_CHAR(dateAdded, 'YYYY-MM-DD') = $2";
          params.push(searchValue);
          countParams.push(searchValue);
          break;
        default:
          // Fallback for title search if searchField doesn't match enum
          query += " AND LOWER(title) LIKE $2";
          countQuery += " AND LOWER(title) LIKE $2";
          params.push(`%${searchValue.toLowerCase()}%`);
          countParams.push(`%${searchValue.toLowerCase()}%`);
          break;
      }
    }

    query +=
      " ORDER BY dateAdded DESC LIMIT $" +
      (params.length + 1) +
      " OFFSET $" +
      (params.length + 2);
    params.push(limit, offset);

    const [result, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(countQuery, countParams),
    ]);

    return {
      results: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async createGame(game: Omit<Game, "id" | "dateadded">): Promise<Game> {
    const result = await this.pool.query(
      `INSERT INTO games (title, rating, timeSpent, email, image_path)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [game.title, game.rating, game.timespent, game.email, game.image_path]
    );
    return result.rows[0];
  }

  async updateGame(id: number, game: Partial<Game>): Promise<Game | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(game).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    const query = `UPDATE games SET ${fields.join(
      ", "
    )} WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteGame(id: number, email: string): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM games WHERE id = $1 AND email = $2",
      [id, email]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async getGameById(id: number): Promise<Game | null> {
    const result = await this.pool.query("SELECT * FROM games WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  }

  async getUserStats(email: string) {
    const result = await this.pool.query(
      `SELECT
        COUNT(*) AS total_games,
        COALESCE(SUM(timespent), 0) AS total_time,
        COALESCE(AVG(rating), 0) AS avg_rating,
        COALESCE(AVG(timespent), 0) AS avg_time
      FROM games
      WHERE email = $1`,
      [email]
    );

    const stats = result.rows[0];
    return {
      totalGames: Number(stats.total_games),
      totalTime: Number(stats.total_time),
      avgRating: Number(stats.avg_rating),
      avgTime: Number(stats.avg_time),
    };
  }
}

export const gameRepository = new GameRepository();
