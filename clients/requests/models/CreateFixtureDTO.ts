/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateFixtureDTO = {
    /**
     * Date and time of the fixture
     */
    date: string;
    /**
     * ID of the home team
     */
    homeTeamId?: number;
    /**
     * ID of the away team
     */
    awayTeamId?: number;
    /**
     * Competition ID associated with the fixture
     */
    competitionId: number;
    /**
     * Season ID associated with the fixture
     */
    seasonId: number;
    /**
     * Stadium ID where the fixture takes place
     */
    stadiumId: number;
    /**
     * Status of the fixture
     */
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed' | 'Suspended' | 'In Play';
    /**
     * Attendance for the fixture
     */
    attendance?: number;
};
