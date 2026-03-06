export interface Match {
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

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  content: string;
  image?: string;
}
