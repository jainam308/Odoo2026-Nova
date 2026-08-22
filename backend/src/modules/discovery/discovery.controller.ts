import { Request, Response, NextFunction } from 'express';
import db from '../../db';

export interface CityRecord {
  id: number;
  name: string;
  country: string;
  cost_index: number;
  popularity: number;
  image_url: string | null;
}

export interface ActivityRecord {
  id: number;
  city_id: number;
  name: string;
  category: string;
  description: string | null;
  cost: number;
  duration_minutes: number | null;
  image_url: string | null;
  city_name?: string;
  city_country?: string;
}

// ============ CITIES ============

export const getCities = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, country } = req.query;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      conditions.push(`(LOWER(name) LIKE LOWER($${params.length}) OR LOWER(country) LIKE LOWER($${params.length}))`);
    }

    if (country && typeof country === 'string' && country.trim() !== '') {
      params.push(`%${country.trim()}%`);
      conditions.push(`LOWER(country) LIKE LOWER($${params.length})`);
    }

    let queryStr = 'SELECT id, name, country, cost_index, popularity, image_url FROM cities';
    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }
    queryStr += ' ORDER BY popularity DESC, name ASC';

    const result = await db.query<CityRecord>(queryStr, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getCityById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query<CityRecord>(
      'SELECT id, name, country, cost_index, popularity, image_url FROM cities WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'City not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ============ ACTIVITIES ============

export const getActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { city_id, category, search } = req.query;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (city_id) {
      params.push(city_id);
      conditions.push(`a.city_id = $${params.length}`);
    }

    if (category && typeof category === 'string' && category.trim() !== '' && category.toLowerCase() !== 'all') {
      params.push(category.toLowerCase().trim());
      conditions.push(`LOWER(a.category) = $${params.length}`);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      conditions.push(`(LOWER(a.name) LIKE LOWER($${params.length}) OR LOWER(a.description) LIKE LOWER($${params.length}))`);
    }

    let queryStr = `
      SELECT a.id, a.city_id, a.name, a.category, a.description, a.cost, a.duration_minutes, a.image_url,
             c.name as city_name, c.country as city_country
      FROM activities a
      LEFT JOIN cities c ON a.city_id = c.id
    `;

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }
    queryStr += ' ORDER BY a.id ASC';

    const result = await db.query<ActivityRecord>(queryStr, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getActivityById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query<ActivityRecord>(
      `SELECT a.id, a.city_id, a.name, a.category, a.description, a.cost, a.duration_minutes, a.image_url,
              c.name as city_name, c.country as city_country
       FROM activities a
       LEFT JOIN cities c ON a.city_id = c.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Activity not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};
