/** Raw stat entry from API-Sports GET /fixtures/statistics */
export interface ApiSportsFixtureStatistic {
    type: string;
    value: string | number | null;
}

export interface ApiSportsFixtureStatisticsTeam {
    team: {
        id: number;
        name: string;
    };
    statistics: ApiSportsFixtureStatistic[];
}

export type ApiSportsFixtureStatisticsResponse = ApiSportsFixtureStatisticsTeam[];
