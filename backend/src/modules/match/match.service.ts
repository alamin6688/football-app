import sportsApi from '../../utils/sportsApi';
import { ILiveScoreResponse, IScheduleResponse } from './match.interface';

export const getLiveScores = async () => {
  try {
    console.log('Fetching live scores from TheSportsDB...');
    const response = await sportsApi.get<ILiveScoreResponse>('/livescore/soccer');
    console.log('Live scores raw response:', JSON.stringify(response.data));
    return response.data.livescore || [];
  } catch (error: any) {
    console.error('Error fetching live scores:', error.message);
    throw new Error('Failed to fetch live scores from TheSportsDB');
  }
};

export const getRecentResults = async (leagueId: string) => {
  try {
    console.log(`Fetching recent results for league: ${leagueId}`);
    const response = await sportsApi.get<IScheduleResponse>(`/schedule/previous/league/${leagueId}`);
    console.log('Recent results raw response:', JSON.stringify(response.data));
    return response.data.events || [];
  } catch (error: any) {
    console.error(`Error fetching recent results for ${leagueId}:`, error.message);
    throw new Error(`Failed to fetch recent results for league ${leagueId}`);
  }
};

export const getUpcomingMatches = async (leagueId: string) => {
  try {
    console.log(`Fetching upcoming matches for league: ${leagueId}`);
    const response = await sportsApi.get<IScheduleResponse>(`/schedule/next/league/${leagueId}`);
    console.log('Upcoming matches raw response:', JSON.stringify(response.data));
    return response.data.events || [];
  } catch (error: any) {
    console.error(`Error fetching upcoming matches for ${leagueId}:`, error.message);
    throw new Error(`Failed to fetch upcoming matches for league ${leagueId}`);
  }
};
