export interface IMatch {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string;
  strTimestamp: string;
  strThumb: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strLeague: string;
}

export interface ILiveScoreResponse {
  livescore: IMatch[];
}

export interface IScheduleResponse {
  events: IMatch[];
}
