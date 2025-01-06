/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateGoalDTO = {
    minute: number;
    scorerId: number;
    assistantId?: number;
    fixtureId: number;
    teamId: number;
    ownGoal?: boolean;
    penalty?: boolean;
};
