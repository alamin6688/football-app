import { Router } from 'express';
import * as matchController from './match.controller';

const router = Router();

router.get('/live', matchController.getLiveScores);
router.get('/recent/:leagueId', matchController.getRecentResults);
router.get('/upcoming/:leagueId', matchController.getUpcomingMatches);
router.get('/latest-news', matchController.getLatestNews);

export default router;
