export type ApiSportsLineupPlayerRow = {
  player?: {
    id?: number;
    name?: string;
    number?: number | null;
    pos?: string;
    grid?: string | null;
  };
};

export type ApiSportsLineupTeam = {
  team?: { id?: number; name?: string; logo?: string };
  coach?: { id?: number; name?: string };
  formation?: string;
  startXI?: ApiSportsLineupPlayerRow[];
  substitutes?: ApiSportsLineupPlayerRow[];
};
