import { Request, Response } from 'express';
import * as matchService from './match.service';

export const getLiveScores = async (req: Request, res: Response) => {
  try {
    const data = await matchService.getLiveScores();
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const getRecentResults = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;
    const data = await matchService.getRecentResults(leagueId as string);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const getUpcomingMatches = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;
    const data = await matchService.getUpcomingMatches(leagueId as string);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const getLatestNews = async (req: Request, res: Response) => {
  try {
    const mockNews = [
      { id: 1, title: 'Transfer Deadline Day', summary: 'Major transfers happening across Europe.', content: 'Detailed content about deadline day signings...' },
      { id: 2, title: 'Champions League Draw', summary: 'Group stage match-ups revealed.', content: 'Detailed group stage analysis...' },
      { id: 3, title: 'Golden Boot Race', summary: 'Top scorers battle for the trophy.', content: 'Current standings and stats...' },
    ];
    res.json({
      success: true,
      mockNews,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
    });
  }
};
