import { HttpWrapper } from "@iWatchFootball/base-tools/http/httpWrapper";

export class FootballDataApiAdapter {
    private http: HttpWrapper;

    constructor() {
        const directKey = process.env.API_SPORTS_KEY || process.env.APISPORTS_KEY;
        const rapidKey = process.env.FOOTBALLAPISPORTS_API_KEY;
        const headers: Record<string, string> = { Accept: "application/json" };
        if (directKey) {
            headers["x-apisports-key"] = directKey;
        } else if (rapidKey) {
            headers["x-rapidapi-host"] = "v3.football.api-sports.io";
            headers["x-rapidapi-key"] = rapidKey;
        }
        this.http = new HttpWrapper({
            baseUrl: "https://v3.football.api-sports.io",
            headers,
        });
    }

    /**
     * Fetch matches with optional filters
     */
    async getMatches(params?: Record<string, any>): Promise<any | undefined> {
        return this.fetchData("fixtures", params);
    }

    /**
     * Fetch leagues with optional filters
     */
    async getLeagues(params?: Record<string, any>): Promise<any | undefined> {
        return this.fetchData("leagues", params);
    }

    /**
     * Fetch teams with optional filters
     */
    async getTeams(params?: Record<string, any>): Promise<any | undefined> {
        return this.fetchData("teams", params);
    }

    /**
     * Fetch standings based on league and season
     */
    async getStandings(league: number, season: number): Promise<any | undefined> {
        return this.fetchData("standings", { league, season });
    }

    /**
     * Fetch fixtures based on league and season
     */
    async getFixtures(league: number, season: number): Promise<any | undefined> {
        return this.fetchData("fixtures", { league, season });
    }

    /**
     * Fetch players with optional filters
     */
    async getPlayers(params?: Record<string, any>): Promise<any | undefined> {
        return this.fetchData("players", params);
    }

    /**
     * Generic method to fetch data from the API
     */
    private async fetchData(endpoint: string, params?: Record<string, any>): Promise<any | undefined> {
        try {
            const resp = await this.http.request<any>({
                method: "GET",
                path: `/${endpoint}`,
                params,
            });
            return resp.data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return undefined;
        }
    }
}
