import { Request, Response, NextFunction } from 'express';
import type { CreateTripInput } from '../../types/trip';

// Mock array for initial route testing prior to DB integration
let mockTrips: any[] = [];

export const createTrip = async (
  req: Request<{}, {}, CreateTripInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, start_date, end_date, cover_photo_url } = req.body;
    const errors: string[] = [];

    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      errors.push('Trip name must be at least 3 characters long.');
    } else if (name.trim().length > 100) {
      errors.push('Trip name cannot exceed 100 characters.');
    }

    if (!start_date || typeof start_date !== 'string') {
      errors.push('A valid start date is required.');
    }

    if (!end_date || typeof end_date !== 'string') {
      errors.push('A valid end date is required.');
    }

    if (start_date && end_date && end_date < start_date) {
      errors.push('End date cannot be earlier than start date.');
    }

    if (cover_photo_url && (typeof cover_photo_url !== 'string' || !/^(https?:\/\/).+/i.test(cover_photo_url))) {
      errors.push('Cover photo URL must be a valid HTTP or HTTPS URL.');
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    const newTrip = {
      id: Date.now(),
      user_id: (req as any).user?.id || 1, // Fallback until auth middleware is mounted
      name: name.trim(),
      description: description ? description.trim() : '',
      start_date,
      end_date,
      cover_photo_url: cover_photo_url ? cover_photo_url.trim() : undefined,
      is_public: Boolean((req.body as any).is_public),
      created_at: new Date().toISOString()
    };

    mockTrips.push(newTrip);
    res.status(201).json({ success: true, trip: newTrip });
  } catch (error) {
    next(error);
  }
};

export const getUserTrips = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, data: mockTrips });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ success: false, message: 'Invalid trip ID parameter' });
      return;
    }

    const trip = mockTrips.find(t => t.id === id);
    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ success: false, message: 'Invalid trip ID parameter' });
      return;
    }

    const index = mockTrips.findIndex(t => t.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }

    const { name, start_date, end_date } = req.body;
    if (name && (typeof name !== 'string' || name.trim().length < 3)) {
      res.status(400).json({ success: false, message: 'Trip name must be at least 3 characters' });
      return;
    }

    if (start_date && end_date && end_date < start_date) {
      res.status(400).json({ success: false, message: 'End date cannot be earlier than start date' });
      return;
    }

    mockTrips[index] = { ...mockTrips[index], ...req.body };
    res.status(200).json({ success: true, data: mockTrips[index] });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ success: false, message: 'Invalid trip ID parameter' });
      return;
    }

    mockTrips = mockTrips.filter(t => t.id !== id);
    res.status(200).json({ success: true, deleted: true });
  } catch (error) {
    next(error);
  }
};