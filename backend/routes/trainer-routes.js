import express from 'express';
import { completeTrainerOnboarding } from '../controllers/trainer-controller.js';
import authmiddleware from '../middleware/auth-middleware.js';
const router = express.Router();
router.post('/onboarding/trainer',authmiddleware,completeTrainerOnboarding);
// router.get('/trainees/search',authmiddleware,searchTrainees);
export default router;
