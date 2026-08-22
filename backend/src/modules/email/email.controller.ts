import { Request, Response, NextFunction } from 'express';
import db from '../../db';
import { sendTripDeparturePack, sendWelcomeEmail } from '../../services/email.service';
import { generateTripIcs } from '../../services/ics.generator';

export const sendItineraryEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { tripId, emails, customNote, attachIcs = true } = req.body;

    if (!tripId || isNaN(Number(tripId))) {
      res.status(400).json({ success: false, message: 'Valid tripId is required.' });
      return;
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      res.status(400).json({ success: false, message: 'At least one recipient email is required.' });
      return;
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.map((e) => String(e).trim().toLowerCase()).filter((e) => emailRegex.test(e));

    if (validEmails.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide valid email address(es).' });
      return;
    }

    // Fetch trip from PostgreSQL
    const tripRes = await db.query(
      `SELECT t.id, t.name, t.description,
              TO_CHAR(t.start_date, 'YYYY-MM-DD') as start_date,
              TO_CHAR(t.end_date, 'YYYY-MM-DD') as end_date,
              t.cover_photo_url,
              u.first_name, u.last_name
       FROM trips t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [Number(tripId)]
    );

    if (tripRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Trip not found.' });
      return;
    }

    const trip = tripRes.rows[0];

    // Fetch stops
    const stopsRes = await db.query(
      `SELECT ts.id, ts.trip_id,
              TO_CHAR(ts.start_date, 'YYYY-MM-DD') as start_date,
              TO_CHAR(ts.end_date, 'YYYY-MM-DD') as end_date,
              ts.budget,
              COALESCE(c.name, 'City Stop') as city_name,
              COALESCE(c.country, 'India') as country
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1
       ORDER BY ts.order_index ASC, ts.start_date ASC`,
      [trip.id]
    );

    const stops = stopsRes.rows;
    const stopIds = stops.map((s) => s.id);

    // Fetch activities
    let activitiesMap: Record<number, any[]> = {};
    if (stopIds.length > 0) {
      const actRes = await db.query(
        `SELECT sa.id, sa.trip_stop_id, sa.custom_name as name,
                sa.custom_cost as cost, sa.notes,
                COALESCE(a.category, 'Sightseeing') as category,
                COALESCE(a.duration_minutes, 60) as duration_minutes
         FROM stop_activities sa
         LEFT JOIN activities a ON sa.activity_id = a.id
         WHERE sa.trip_stop_id = ANY($1::int[])
         ORDER BY sa.order_index ASC`,
        [stopIds]
      );

      for (const act of actRes.rows) {
        if (!activitiesMap[act.trip_stop_id]) activitiesMap[act.trip_stop_id] = [];
        activitiesMap[act.trip_stop_id].push(act);
      }
    }

    trip.stops = stops.map((s) => ({
      ...s,
      activities: activitiesMap[s.id] || [],
    }));

    const senderName = req.user?.first_name
      ? `${req.user.first_name} ${req.user.last_name || ''}`.trim()
      : trip.first_name || 'GlobeTrotter Traveler';

    const result = await sendTripDeparturePack({
      trip,
      recipientEmails: validEmails,
      senderName,
      customNote,
      attachIcs,
    });

    res.status(200).json({
      success: true,
      message: `Departure Pack sent to ${validEmails.length} recipient(s).`,
      previewUrl: result.previewUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadTripIcs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid trip ID.' });
      return;
    }

    const tripRes = await db.query(
      `SELECT t.id, t.name, t.description,
              TO_CHAR(t.start_date, 'YYYY-MM-DD') as start_date,
              TO_CHAR(t.end_date, 'YYYY-MM-DD') as end_date
       FROM trips t WHERE t.id = $1`,
      [id]
    );

    if (tripRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Trip not found.' });
      return;
    }

    const trip = tripRes.rows[0];

    const stopsRes = await db.query(
      `SELECT ts.id, ts.trip_id,
              TO_CHAR(ts.start_date, 'YYYY-MM-DD') as start_date,
              TO_CHAR(ts.end_date, 'YYYY-MM-DD') as end_date,
              COALESCE(c.name, 'City Stop') as city_name,
              COALESCE(c.country, 'India') as country
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1
       ORDER BY ts.order_index ASC, ts.start_date ASC`,
      [id]
    );

    trip.stops = stopsRes.rows;

    const icsString = generateTripIcs(trip);
    const filename = `${trip.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-itinerary.ics`;

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(icsString);
  } catch (error) {
    next(error);
  }
};

export const triggerWelcomeTestEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = req.body.email || req.user?.email || 'traveler@globetrotter.com';
    const firstName = req.body.firstName || req.user?.first_name || 'Traveler';
    const result = await sendWelcomeEmail({ email, firstName });
    res.json({ success: true, message: 'Welcome email test dispatched', previewUrl: result.previewUrl });
  } catch (error) {
    next(error);
  }
};
