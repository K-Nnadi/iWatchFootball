import { Team } from '../team/team.entity';
import { ManagerEmployment } from '../managerEmployment/managerEmployment.entity';
import { Manager } from './manager.entity';

export type ManagerCareerSource = 'employment' | 'teamIds' | 'teamManagerId';

export type ManagerCareerRow = {
    teamId: number;
    teamName: string;
    crest?: string | null;
    from?: string;
    to?: string;
    isCurrent: boolean;
    source: ManagerCareerSource;
};

export type ManagerMatchRow = {
    id: number;
    date: string;
    homeTeamId: number;
    awayTeamId: number;
    homeTeamName: string;
    awayTeamName: string;
    homeScore?: number;
    awayScore?: number;
    metadata?: unknown;
};

export type ManagerProfileResponse = {
    manager: Pick<Manager, 'id' | 'name' | 'nickname' | 'nationality' | 'teamIds' | 'metadata'>;
    career: ManagerCareerRow[];
    currentTeamId?: number;
    clubsManagedCount: number;
    recentMatches: ManagerMatchRow[];
};

export type ManagedTeamRow = Pick<Team, 'id' | 'name' | 'logoUrl' | 'managerId'>;
