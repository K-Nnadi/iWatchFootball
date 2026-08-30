/** API-Football v3 fixture event (embedded in live/fixtures or from GET /fixtures/events). */
export type ApiSportsFixtureEvent = {
  time?: { elapsed?: number | null; extra?: number | null };
  team?: { id?: number; name?: string };
  player?: { id?: number; name?: string };
  assist?: { id?: number; name?: string };
  type?: string;
  detail?: string;
  comments?: string | null;
};

export type ApiSportsFixtureEventsSyncResult = {
  goals: number;
  cards: number;
  substitutions: number;
  skipped: number;
};
