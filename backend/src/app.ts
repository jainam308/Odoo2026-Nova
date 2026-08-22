import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import db from './db';
import routes from './routes';
import stopsRouter from './routes/stops.routes';
import errorHandler from './middleware/errorHandler';

const app: Express = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
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

import adminRouter from './routes/admin.routes';

// Mount Central API Routes (Module A + Module B)
app.use('/api', routes);

// Mount Module C Itinerary & Stops Routes
app.use('/api', stopsRouter);

// Mount Admin Panel Routes
app.use('/api/admin', adminRouter);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
