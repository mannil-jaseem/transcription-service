import { Router } from 'express';
import transcriptionRoutes from '../features/transcription/transcription.route';

const router: Router = Router();

router.use(
    '/api',
     transcriptionRoutes
    );

export default router;

