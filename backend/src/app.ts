import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import db from './db';
import routes from './routes';
import errorHandler from './middleware/errorHandler';
import tripsRouter from './routes/trips.routes';
import stopsRouter from './routes/stops.routes';

const app: Express = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.use('/api/trips', tripsRouter);

interface HealthResponse {
  success: boolean;
  status: 'healthy' | 'unhealthy';
  database?: string;
  server_time?: string;
  error?: string;
}

app.get('/api/health', async (_req: Request, res: Response<HealthResponse>) => {
  try {
    const result = await db.query<{ now: string }>('SELECT NOW() as now');
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      server_time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

// Module C (Itinerary & Sharing) — single mount line.
app.use('/api', stopsRouter);

// Mount Central API Routes
app.use('/api', routes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
