// generated with @7nohe/openapi-react-query-codegen@0.5.1 
import { useQuery, useMutation, UseQueryResult, UseQueryOptions, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { User } from "../requests/models/User";
import { Trophy } from "../requests/models/Trophy";
import { Transfer } from "../requests/models/Transfer";
import { TeamCompetitionSeason } from "../requests/models/TeamCompetitionSeason";
import { Team } from "../requests/models/Team";
import { Substitution } from "../requests/models/Substitution";
import { Stadium } from "../requests/models/Stadium";
import { Season } from "../requests/models/Season";
import { RegisterBody } from "../requests/models/RegisterBody";
import { Referee } from "../requests/models/Referee";
import { Promise } from "../requests/models/Promise";
import { Prediction } from "../requests/models/Prediction";
import { Position } from "../requests/models/Position";
import { PlayerLineUp } from "../requests/models/PlayerLineUp";
import { Player } from "../requests/models/Player";
import { ManagerEmployment } from "../requests/models/ManagerEmployment";
import { Manager } from "../requests/models/Manager";
import { LoginBody } from "../requests/models/LoginBody";
import { Log } from "../requests/models/Log";
import { LineUp } from "../requests/models/LineUp";
import { Injury } from "../requests/models/Injury";
import { Goal } from "../requests/models/Goal";
import { GenericToken } from "../requests/models/GenericToken";
import { FixtureReferee } from "../requests/models/FixtureReferee";
import { Fixture } from "../requests/models/Fixture";
import { CreateUserDTO } from "../requests/models/CreateUserDTO";
import { CreateTrophyDTO } from "../requests/models/CreateTrophyDTO";
import { CreateTransferDTO } from "../requests/models/CreateTransferDTO";
import { CreateTeamDTO } from "../requests/models/CreateTeamDTO";
import { CreateTeamCompetitionSeasonDTO } from "../requests/models/CreateTeamCompetitionSeasonDTO";
import { CreateSubstitutionDTO } from "../requests/models/CreateSubstitutionDTO";
import { CreateStadiumDTO } from "../requests/models/CreateStadiumDTO";
import { CreateSeasonDTO } from "../requests/models/CreateSeasonDTO";
import { CreateRefereeDTO } from "../requests/models/CreateRefereeDTO";
import { CreatePredictionDTO } from "../requests/models/CreatePredictionDTO";
import { CreatePositionDTO } from "../requests/models/CreatePositionDTO";
import { CreatePlayerLineUpDTO } from "../requests/models/CreatePlayerLineUpDTO";
import { CreatePlayerDTO } from "../requests/models/CreatePlayerDTO";
import { CreateManagerEmploymentDTO } from "../requests/models/CreateManagerEmploymentDTO";
import { CreateManagerDTO } from "../requests/models/CreateManagerDTO";
import { CreateLogDTO } from "../requests/models/CreateLogDTO";
import { CreateLineUpDTO } from "../requests/models/CreateLineUpDTO";
import { CreateInjuryDTO } from "../requests/models/CreateInjuryDTO";
import { CreateGoalDTO } from "../requests/models/CreateGoalDTO";
import { CreateGenericTokenDTO } from "../requests/models/CreateGenericTokenDTO";
import { CreateFixtureRefereeDTO } from "../requests/models/CreateFixtureRefereeDTO";
import { CreateFixtureDTO } from "../requests/models/CreateFixtureDTO";
import { CreateCompetitionDTO } from "../requests/models/CreateCompetitionDTO";
import { CreateCardDTO } from "../requests/models/CreateCardDTO";
import { CreateAddressDTO } from "../requests/models/CreateAddressDTO";
import { Competition } from "../requests/models/Competition";
import { Card } from "../requests/models/Card";
import { AuthResponse } from "../requests/models/AuthResponse";
import { Address } from "../requests/models/Address";
import { User } from "../requests/services/User";
import { Trophy } from "../requests/services/Trophy";
import { Transfer } from "../requests/services/Transfer";
import { TeamCompetitionSeason } from "../requests/services/TeamCompetitionSeason";
import { Team } from "../requests/services/Team";
import { Substitution } from "../requests/services/Substitution";
import { Stadium } from "../requests/services/Stadium";
import { Season } from "../requests/services/Season";
import { Referee } from "../requests/services/Referee";
import { Prediction } from "../requests/services/Prediction";
import { Position } from "../requests/services/Position";
import { PlayerLineUp } from "../requests/services/PlayerLineUp";
import { Player } from "../requests/services/Player";
import { ManagerEmployment } from "../requests/services/ManagerEmployment";
import { Manager } from "../requests/services/Manager";
import { Log } from "../requests/services/Log";
import { LineUp } from "../requests/services/LineUp";
import { Injury } from "../requests/services/Injury";
import { Goal } from "../requests/services/Goal";
import { GenericToken } from "../requests/services/GenericToken";
import { FixtureReferee } from "../requests/services/FixtureReferee";
import { Fixture } from "../requests/services/Fixture";
import { Competition } from "../requests/services/Competition";
import { Card } from "../requests/services/Card";
import { Auth } from "../requests/services/Auth";
import { Address } from "../requests/services/Address";
export const useUserCreate = <TData = Awaited<ReturnType<typeof User.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof User.create>>, unknown, {
    requestBody: CreateUserDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => User.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof User.create>>, TError, {
    requestBody: CreateUserDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useUserGetAllKey = "UserGetAll";
export const useUserGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof User.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof User.getAll>>, unknown, Awaited<ReturnType<typeof User.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useUserGetAllKey, ...(queryKey ?? [])], queryFn: () => User.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof User.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useUserGetQueryKey = "UserGetQuery";
export const useUserGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof User.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof User.getQuery>>, unknown, Awaited<ReturnType<typeof User.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useUserGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => User.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof User.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useUserGetOneKey = "UserGetOne";
export const useUserGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof User.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof User.getOne>>, unknown, Awaited<ReturnType<typeof User.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useUserGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => User.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof User.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useUserUpdateOne = <TData = Awaited<ReturnType<typeof User.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof User.updateOne>>, unknown, {
    id: number;
    requestBody: User;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => User.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof User.updateOne>>, TError, {
    id: number;
    requestBody: User;
}, TContext>, "data"> & {
    data: TData;
};
export const useUserDeleteOne = <TData = Awaited<ReturnType<typeof User.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof User.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => User.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof User.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useTrophyCreate = <TData = Awaited<ReturnType<typeof Trophy.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Trophy.create>>, unknown, {
    requestBody: CreateTrophyDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Trophy.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Trophy.create>>, TError, {
    requestBody: CreateTrophyDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useTrophyGetAllKey = "TrophyGetAll";
export const useTrophyGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Trophy.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Trophy.getAll>>, unknown, Awaited<ReturnType<typeof Trophy.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTrophyGetAllKey, ...(queryKey ?? [])], queryFn: () => Trophy.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Trophy.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useTrophyGetQueryKey = "TrophyGetQuery";
export const useTrophyGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Trophy.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Trophy.getQuery>>, unknown, Awaited<ReturnType<typeof Trophy.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTrophyGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Trophy.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Trophy.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useTrophyGetOneKey = "TrophyGetOne";
export const useTrophyGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Trophy.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Trophy.getOne>>, unknown, Awaited<ReturnType<typeof Trophy.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTrophyGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Trophy.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Trophy.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useTrophyUpdateOne = <TData = Awaited<ReturnType<typeof Trophy.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Trophy.updateOne>>, unknown, {
    id: number;
    requestBody: Trophy;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Trophy.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Trophy.updateOne>>, TError, {
    id: number;
    requestBody: Trophy;
}, TContext>, "data"> & {
    data: TData;
};
export const useTrophyDeleteOne = <TData = Awaited<ReturnType<typeof Trophy.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Trophy.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Trophy.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Trophy.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useTransferCreate = <TData = Awaited<ReturnType<typeof Transfer.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Transfer.create>>, unknown, {
    requestBody: CreateTransferDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Transfer.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Transfer.create>>, TError, {
    requestBody: CreateTransferDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useTransferGetAllKey = "TransferGetAll";
export const useTransferGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Transfer.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Transfer.getAll>>, unknown, Awaited<ReturnType<typeof Transfer.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTransferGetAllKey, ...(queryKey ?? [])], queryFn: () => Transfer.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Transfer.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useTransferGetQueryKey = "TransferGetQuery";
export const useTransferGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Transfer.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Transfer.getQuery>>, unknown, Awaited<ReturnType<typeof Transfer.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTransferGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Transfer.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Transfer.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useTransferGetOneKey = "TransferGetOne";
export const useTransferGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Transfer.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Transfer.getOne>>, unknown, Awaited<ReturnType<typeof Transfer.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTransferGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Transfer.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Transfer.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useTransferUpdateOne = <TData = Awaited<ReturnType<typeof Transfer.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Transfer.updateOne>>, unknown, {
    id: number;
    requestBody: Transfer;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Transfer.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Transfer.updateOne>>, TError, {
    id: number;
    requestBody: Transfer;
}, TContext>, "data"> & {
    data: TData;
};
export const useTransferDeleteOne = <TData = Awaited<ReturnType<typeof Transfer.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Transfer.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Transfer.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Transfer.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useTeamCompetitionSeasonCreate = <TData = Awaited<ReturnType<typeof TeamCompetitionSeason.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof TeamCompetitionSeason.create>>, unknown, {
    requestBody: CreateTeamCompetitionSeasonDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => TeamCompetitionSeason.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof TeamCompetitionSeason.create>>, TError, {
    requestBody: CreateTeamCompetitionSeasonDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useTeamCompetitionSeasonGetAllKey = "TeamCompetitionSeasonGetAll";
export const useTeamCompetitionSeasonGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof TeamCompetitionSeason.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof TeamCompetitionSeason.getAll>>, unknown, Awaited<ReturnType<typeof TeamCompetitionSeason.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTeamCompetitionSeasonGetAllKey, ...(queryKey ?? [])], queryFn: () => TeamCompetitionSeason.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof TeamCompetitionSeason.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useTeamCompetitionSeasonGetQueryKey = "TeamCompetitionSeasonGetQuery";
export const useTeamCompetitionSeasonGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof TeamCompetitionSeason.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof TeamCompetitionSeason.getQuery>>, unknown, Awaited<ReturnType<typeof TeamCompetitionSeason.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTeamCompetitionSeasonGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => TeamCompetitionSeason.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof TeamCompetitionSeason.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useTeamCompetitionSeasonGetOneKey = "TeamCompetitionSeasonGetOne";
export const useTeamCompetitionSeasonGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof TeamCompetitionSeason.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof TeamCompetitionSeason.getOne>>, unknown, Awaited<ReturnType<typeof TeamCompetitionSeason.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTeamCompetitionSeasonGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => TeamCompetitionSeason.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof TeamCompetitionSeason.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useTeamCompetitionSeasonUpdateOne = <TData = Awaited<ReturnType<typeof TeamCompetitionSeason.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof TeamCompetitionSeason.updateOne>>, unknown, {
    id: number;
    requestBody: TeamCompetitionSeason;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => TeamCompetitionSeason.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof TeamCompetitionSeason.updateOne>>, TError, {
    id: number;
    requestBody: TeamCompetitionSeason;
}, TContext>, "data"> & {
    data: TData;
};
export const useTeamCompetitionSeasonDeleteOne = <TData = Awaited<ReturnType<typeof TeamCompetitionSeason.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof TeamCompetitionSeason.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => TeamCompetitionSeason.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof TeamCompetitionSeason.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useTeamCreate = <TData = Awaited<ReturnType<typeof Team.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Team.create>>, unknown, {
    requestBody: CreateTeamDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Team.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Team.create>>, TError, {
    requestBody: CreateTeamDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useTeamGetAllKey = "TeamGetAll";
export const useTeamGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Team.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Team.getAll>>, unknown, Awaited<ReturnType<typeof Team.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTeamGetAllKey, ...(queryKey ?? [])], queryFn: () => Team.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Team.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useTeamGetQueryKey = "TeamGetQuery";
export const useTeamGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Team.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Team.getQuery>>, unknown, Awaited<ReturnType<typeof Team.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTeamGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Team.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Team.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useTeamGetOneKey = "TeamGetOne";
export const useTeamGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Team.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Team.getOne>>, unknown, Awaited<ReturnType<typeof Team.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useTeamGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Team.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Team.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useTeamUpdateOne = <TData = Awaited<ReturnType<typeof Team.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Team.updateOne>>, unknown, {
    id: number;
    requestBody: Team;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Team.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Team.updateOne>>, TError, {
    id: number;
    requestBody: Team;
}, TContext>, "data"> & {
    data: TData;
};
export const useTeamDeleteOne = <TData = Awaited<ReturnType<typeof Team.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Team.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Team.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Team.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useSubstitutionCreate = <TData = Awaited<ReturnType<typeof Substitution.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Substitution.create>>, unknown, {
    requestBody: CreateSubstitutionDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Substitution.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Substitution.create>>, TError, {
    requestBody: CreateSubstitutionDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useSubstitutionGetAllKey = "SubstitutionGetAll";
export const useSubstitutionGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Substitution.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Substitution.getAll>>, unknown, Awaited<ReturnType<typeof Substitution.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useSubstitutionGetAllKey, ...(queryKey ?? [])], queryFn: () => Substitution.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Substitution.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useSubstitutionGetQueryKey = "SubstitutionGetQuery";
export const useSubstitutionGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Substitution.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Substitution.getQuery>>, unknown, Awaited<ReturnType<typeof Substitution.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useSubstitutionGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Substitution.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Substitution.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useSubstitutionGetOneKey = "SubstitutionGetOne";
export const useSubstitutionGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Substitution.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Substitution.getOne>>, unknown, Awaited<ReturnType<typeof Substitution.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useSubstitutionGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Substitution.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Substitution.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useSubstitutionUpdateOne = <TData = Awaited<ReturnType<typeof Substitution.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Substitution.updateOne>>, unknown, {
    id: number;
    requestBody: Substitution;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Substitution.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Substitution.updateOne>>, TError, {
    id: number;
    requestBody: Substitution;
}, TContext>, "data"> & {
    data: TData;
};
export const useSubstitutionDeleteOne = <TData = Awaited<ReturnType<typeof Substitution.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Substitution.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Substitution.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Substitution.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useStadiumCreate = <TData = Awaited<ReturnType<typeof Stadium.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Stadium.create>>, unknown, {
    requestBody: CreateStadiumDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Stadium.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Stadium.create>>, TError, {
    requestBody: CreateStadiumDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useStadiumGetAllKey = "StadiumGetAll";
export const useStadiumGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Stadium.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Stadium.getAll>>, unknown, Awaited<ReturnType<typeof Stadium.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useStadiumGetAllKey, ...(queryKey ?? [])], queryFn: () => Stadium.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Stadium.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useStadiumGetQueryKey = "StadiumGetQuery";
export const useStadiumGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Stadium.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Stadium.getQuery>>, unknown, Awaited<ReturnType<typeof Stadium.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useStadiumGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Stadium.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Stadium.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useStadiumGetOneKey = "StadiumGetOne";
export const useStadiumGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Stadium.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Stadium.getOne>>, unknown, Awaited<ReturnType<typeof Stadium.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useStadiumGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Stadium.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Stadium.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useStadiumUpdateOne = <TData = Awaited<ReturnType<typeof Stadium.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Stadium.updateOne>>, unknown, {
    id: number;
    requestBody: Stadium;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Stadium.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Stadium.updateOne>>, TError, {
    id: number;
    requestBody: Stadium;
}, TContext>, "data"> & {
    data: TData;
};
export const useStadiumDeleteOne = <TData = Awaited<ReturnType<typeof Stadium.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Stadium.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Stadium.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Stadium.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useSeasonCreate = <TData = Awaited<ReturnType<typeof Season.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Season.create>>, unknown, {
    requestBody: CreateSeasonDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Season.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Season.create>>, TError, {
    requestBody: CreateSeasonDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useSeasonGetAllKey = "SeasonGetAll";
export const useSeasonGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Season.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Season.getAll>>, unknown, Awaited<ReturnType<typeof Season.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useSeasonGetAllKey, ...(queryKey ?? [])], queryFn: () => Season.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Season.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useSeasonGetQueryKey = "SeasonGetQuery";
export const useSeasonGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Season.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Season.getQuery>>, unknown, Awaited<ReturnType<typeof Season.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useSeasonGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Season.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Season.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useSeasonGetOneKey = "SeasonGetOne";
export const useSeasonGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Season.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Season.getOne>>, unknown, Awaited<ReturnType<typeof Season.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useSeasonGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Season.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Season.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useSeasonUpdateOne = <TData = Awaited<ReturnType<typeof Season.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Season.updateOne>>, unknown, {
    id: number;
    requestBody: Season;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Season.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Season.updateOne>>, TError, {
    id: number;
    requestBody: Season;
}, TContext>, "data"> & {
    data: TData;
};
export const useSeasonDeleteOne = <TData = Awaited<ReturnType<typeof Season.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Season.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Season.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Season.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useRefereeCreate = <TData = Awaited<ReturnType<typeof Referee.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Referee.create>>, unknown, {
    requestBody: CreateRefereeDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Referee.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Referee.create>>, TError, {
    requestBody: CreateRefereeDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useRefereeGetAllKey = "RefereeGetAll";
export const useRefereeGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Referee.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Referee.getAll>>, unknown, Awaited<ReturnType<typeof Referee.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useRefereeGetAllKey, ...(queryKey ?? [])], queryFn: () => Referee.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Referee.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useRefereeGetQueryKey = "RefereeGetQuery";
export const useRefereeGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Referee.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Referee.getQuery>>, unknown, Awaited<ReturnType<typeof Referee.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useRefereeGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Referee.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Referee.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useRefereeGetOneKey = "RefereeGetOne";
export const useRefereeGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Referee.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Referee.getOne>>, unknown, Awaited<ReturnType<typeof Referee.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useRefereeGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Referee.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Referee.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useRefereeUpdateOne = <TData = Awaited<ReturnType<typeof Referee.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Referee.updateOne>>, unknown, {
    id: number;
    requestBody: Referee;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Referee.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Referee.updateOne>>, TError, {
    id: number;
    requestBody: Referee;
}, TContext>, "data"> & {
    data: TData;
};
export const useRefereeDeleteOne = <TData = Awaited<ReturnType<typeof Referee.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Referee.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Referee.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Referee.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const usePredictionCreate = <TData = Awaited<ReturnType<typeof Prediction.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Prediction.create>>, unknown, {
    requestBody: CreatePredictionDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Prediction.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Prediction.create>>, TError, {
    requestBody: CreatePredictionDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const usePredictionGetAllKey = "PredictionGetAll";
export const usePredictionGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Prediction.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Prediction.getAll>>, unknown, Awaited<ReturnType<typeof Prediction.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePredictionGetAllKey, ...(queryKey ?? [])], queryFn: () => Prediction.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Prediction.getAll>>, TError>, "data"> & {
    data: TData;
};
export const usePredictionGetQueryKey = "PredictionGetQuery";
export const usePredictionGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Prediction.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Prediction.getQuery>>, unknown, Awaited<ReturnType<typeof Prediction.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePredictionGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Prediction.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Prediction.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const usePredictionGetOneKey = "PredictionGetOne";
export const usePredictionGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Prediction.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Prediction.getOne>>, unknown, Awaited<ReturnType<typeof Prediction.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePredictionGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Prediction.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Prediction.getOne>>, TError>, "data"> & {
    data: TData;
};
export const usePredictionUpdateOne = <TData = Awaited<ReturnType<typeof Prediction.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Prediction.updateOne>>, unknown, {
    id: number;
    requestBody: Prediction;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Prediction.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Prediction.updateOne>>, TError, {
    id: number;
    requestBody: Prediction;
}, TContext>, "data"> & {
    data: TData;
};
export const usePredictionDeleteOne = <TData = Awaited<ReturnType<typeof Prediction.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Prediction.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Prediction.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Prediction.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const usePositionCreate = <TData = Awaited<ReturnType<typeof Position.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Position.create>>, unknown, {
    requestBody: CreatePositionDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Position.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Position.create>>, TError, {
    requestBody: CreatePositionDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const usePositionGetAllKey = "PositionGetAll";
export const usePositionGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Position.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Position.getAll>>, unknown, Awaited<ReturnType<typeof Position.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePositionGetAllKey, ...(queryKey ?? [])], queryFn: () => Position.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Position.getAll>>, TError>, "data"> & {
    data: TData;
};
export const usePositionGetQueryKey = "PositionGetQuery";
export const usePositionGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Position.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Position.getQuery>>, unknown, Awaited<ReturnType<typeof Position.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePositionGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Position.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Position.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const usePositionGetOneKey = "PositionGetOne";
export const usePositionGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Position.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Position.getOne>>, unknown, Awaited<ReturnType<typeof Position.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePositionGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Position.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Position.getOne>>, TError>, "data"> & {
    data: TData;
};
export const usePositionUpdateOne = <TData = Awaited<ReturnType<typeof Position.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Position.updateOne>>, unknown, {
    id: number;
    requestBody: Position;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Position.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Position.updateOne>>, TError, {
    id: number;
    requestBody: Position;
}, TContext>, "data"> & {
    data: TData;
};
export const usePositionDeleteOne = <TData = Awaited<ReturnType<typeof Position.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Position.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Position.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Position.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const usePlayerLineUpCreate = <TData = Awaited<ReturnType<typeof PlayerLineUp.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof PlayerLineUp.create>>, unknown, {
    requestBody: CreatePlayerLineUpDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => PlayerLineUp.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof PlayerLineUp.create>>, TError, {
    requestBody: CreatePlayerLineUpDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const usePlayerLineUpGetAllKey = "PlayerLineUpGetAll";
export const usePlayerLineUpGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof PlayerLineUp.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof PlayerLineUp.getAll>>, unknown, Awaited<ReturnType<typeof PlayerLineUp.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePlayerLineUpGetAllKey, ...(queryKey ?? [])], queryFn: () => PlayerLineUp.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof PlayerLineUp.getAll>>, TError>, "data"> & {
    data: TData;
};
export const usePlayerLineUpGetQueryKey = "PlayerLineUpGetQuery";
export const usePlayerLineUpGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof PlayerLineUp.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof PlayerLineUp.getQuery>>, unknown, Awaited<ReturnType<typeof PlayerLineUp.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePlayerLineUpGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => PlayerLineUp.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof PlayerLineUp.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const usePlayerLineUpGetOneKey = "PlayerLineUpGetOne";
export const usePlayerLineUpGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof PlayerLineUp.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof PlayerLineUp.getOne>>, unknown, Awaited<ReturnType<typeof PlayerLineUp.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePlayerLineUpGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => PlayerLineUp.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof PlayerLineUp.getOne>>, TError>, "data"> & {
    data: TData;
};
export const usePlayerLineUpUpdateOne = <TData = Awaited<ReturnType<typeof PlayerLineUp.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof PlayerLineUp.updateOne>>, unknown, {
    id: number;
    requestBody: PlayerLineUp;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => PlayerLineUp.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof PlayerLineUp.updateOne>>, TError, {
    id: number;
    requestBody: PlayerLineUp;
}, TContext>, "data"> & {
    data: TData;
};
export const usePlayerLineUpDeleteOne = <TData = Awaited<ReturnType<typeof PlayerLineUp.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof PlayerLineUp.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => PlayerLineUp.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof PlayerLineUp.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const usePlayerCreate = <TData = Awaited<ReturnType<typeof Player.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Player.create>>, unknown, {
    requestBody: CreatePlayerDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Player.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Player.create>>, TError, {
    requestBody: CreatePlayerDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const usePlayerGetAllKey = "PlayerGetAll";
export const usePlayerGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Player.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Player.getAll>>, unknown, Awaited<ReturnType<typeof Player.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePlayerGetAllKey, ...(queryKey ?? [])], queryFn: () => Player.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Player.getAll>>, TError>, "data"> & {
    data: TData;
};
export const usePlayerGetQueryKey = "PlayerGetQuery";
export const usePlayerGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Player.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Player.getQuery>>, unknown, Awaited<ReturnType<typeof Player.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePlayerGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Player.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Player.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const usePlayerGetOneKey = "PlayerGetOne";
export const usePlayerGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Player.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Player.getOne>>, unknown, Awaited<ReturnType<typeof Player.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [usePlayerGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Player.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Player.getOne>>, TError>, "data"> & {
    data: TData;
};
export const usePlayerUpdateOne = <TData = Awaited<ReturnType<typeof Player.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Player.updateOne>>, unknown, {
    id: number;
    requestBody: Player;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Player.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Player.updateOne>>, TError, {
    id: number;
    requestBody: Player;
}, TContext>, "data"> & {
    data: TData;
};
export const usePlayerDeleteOne = <TData = Awaited<ReturnType<typeof Player.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Player.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Player.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Player.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useManagerEmploymentCreate = <TData = Awaited<ReturnType<typeof ManagerEmployment.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof ManagerEmployment.create>>, unknown, {
    requestBody: CreateManagerEmploymentDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => ManagerEmployment.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof ManagerEmployment.create>>, TError, {
    requestBody: CreateManagerEmploymentDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useManagerEmploymentGetAllKey = "ManagerEmploymentGetAll";
export const useManagerEmploymentGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof ManagerEmployment.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof ManagerEmployment.getAll>>, unknown, Awaited<ReturnType<typeof ManagerEmployment.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useManagerEmploymentGetAllKey, ...(queryKey ?? [])], queryFn: () => ManagerEmployment.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof ManagerEmployment.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useManagerEmploymentGetQueryKey = "ManagerEmploymentGetQuery";
export const useManagerEmploymentGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof ManagerEmployment.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof ManagerEmployment.getQuery>>, unknown, Awaited<ReturnType<typeof ManagerEmployment.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useManagerEmploymentGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => ManagerEmployment.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof ManagerEmployment.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useManagerEmploymentGetOneKey = "ManagerEmploymentGetOne";
export const useManagerEmploymentGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof ManagerEmployment.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof ManagerEmployment.getOne>>, unknown, Awaited<ReturnType<typeof ManagerEmployment.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useManagerEmploymentGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => ManagerEmployment.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof ManagerEmployment.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useManagerEmploymentUpdateOne = <TData = Awaited<ReturnType<typeof ManagerEmployment.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof ManagerEmployment.updateOne>>, unknown, {
    id: number;
    requestBody: ManagerEmployment;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => ManagerEmployment.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof ManagerEmployment.updateOne>>, TError, {
    id: number;
    requestBody: ManagerEmployment;
}, TContext>, "data"> & {
    data: TData;
};
export const useManagerEmploymentDeleteOne = <TData = Awaited<ReturnType<typeof ManagerEmployment.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof ManagerEmployment.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => ManagerEmployment.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof ManagerEmployment.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useManagerCreate = <TData = Awaited<ReturnType<typeof Manager.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Manager.create>>, unknown, {
    requestBody: CreateManagerDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Manager.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Manager.create>>, TError, {
    requestBody: CreateManagerDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useManagerGetAllKey = "ManagerGetAll";
export const useManagerGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Manager.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Manager.getAll>>, unknown, Awaited<ReturnType<typeof Manager.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useManagerGetAllKey, ...(queryKey ?? [])], queryFn: () => Manager.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Manager.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useManagerGetQueryKey = "ManagerGetQuery";
export const useManagerGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Manager.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Manager.getQuery>>, unknown, Awaited<ReturnType<typeof Manager.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useManagerGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Manager.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Manager.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useManagerGetOneKey = "ManagerGetOne";
export const useManagerGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Manager.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Manager.getOne>>, unknown, Awaited<ReturnType<typeof Manager.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useManagerGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Manager.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Manager.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useManagerUpdateOne = <TData = Awaited<ReturnType<typeof Manager.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Manager.updateOne>>, unknown, {
    id: number;
    requestBody: Manager;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Manager.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Manager.updateOne>>, TError, {
    id: number;
    requestBody: Manager;
}, TContext>, "data"> & {
    data: TData;
};
export const useManagerDeleteOne = <TData = Awaited<ReturnType<typeof Manager.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Manager.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Manager.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Manager.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useLogCreate = <TData = Awaited<ReturnType<typeof Log.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Log.create>>, unknown, {
    requestBody: CreateLogDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Log.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Log.create>>, TError, {
    requestBody: CreateLogDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useLogGetAllKey = "LogGetAll";
export const useLogGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Log.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Log.getAll>>, unknown, Awaited<ReturnType<typeof Log.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useLogGetAllKey, ...(queryKey ?? [])], queryFn: () => Log.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Log.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useLogGetQueryKey = "LogGetQuery";
export const useLogGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Log.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Log.getQuery>>, unknown, Awaited<ReturnType<typeof Log.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useLogGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Log.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Log.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useLogGetOneKey = "LogGetOne";
export const useLogGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Log.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Log.getOne>>, unknown, Awaited<ReturnType<typeof Log.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useLogGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Log.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Log.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useLogUpdateOne = <TData = Awaited<ReturnType<typeof Log.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Log.updateOne>>, unknown, {
    id: number;
    requestBody: Log;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Log.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Log.updateOne>>, TError, {
    id: number;
    requestBody: Log;
}, TContext>, "data"> & {
    data: TData;
};
export const useLogDeleteOne = <TData = Awaited<ReturnType<typeof Log.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Log.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Log.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Log.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useLineUpCreate = <TData = Awaited<ReturnType<typeof LineUp.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof LineUp.create>>, unknown, {
    requestBody: CreateLineUpDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => LineUp.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof LineUp.create>>, TError, {
    requestBody: CreateLineUpDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useLineUpGetAllKey = "LineUpGetAll";
export const useLineUpGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof LineUp.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof LineUp.getAll>>, unknown, Awaited<ReturnType<typeof LineUp.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useLineUpGetAllKey, ...(queryKey ?? [])], queryFn: () => LineUp.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof LineUp.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useLineUpGetQueryKey = "LineUpGetQuery";
export const useLineUpGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof LineUp.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof LineUp.getQuery>>, unknown, Awaited<ReturnType<typeof LineUp.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useLineUpGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => LineUp.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof LineUp.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useLineUpGetOneKey = "LineUpGetOne";
export const useLineUpGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof LineUp.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof LineUp.getOne>>, unknown, Awaited<ReturnType<typeof LineUp.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useLineUpGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => LineUp.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof LineUp.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useLineUpUpdateOne = <TData = Awaited<ReturnType<typeof LineUp.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof LineUp.updateOne>>, unknown, {
    id: number;
    requestBody: LineUp;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => LineUp.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof LineUp.updateOne>>, TError, {
    id: number;
    requestBody: LineUp;
}, TContext>, "data"> & {
    data: TData;
};
export const useLineUpDeleteOne = <TData = Awaited<ReturnType<typeof LineUp.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof LineUp.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => LineUp.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof LineUp.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useInjuryCreate = <TData = Awaited<ReturnType<typeof Injury.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Injury.create>>, unknown, {
    requestBody: CreateInjuryDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Injury.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Injury.create>>, TError, {
    requestBody: CreateInjuryDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useInjuryGetAllKey = "InjuryGetAll";
export const useInjuryGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Injury.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Injury.getAll>>, unknown, Awaited<ReturnType<typeof Injury.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useInjuryGetAllKey, ...(queryKey ?? [])], queryFn: () => Injury.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Injury.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useInjuryGetQueryKey = "InjuryGetQuery";
export const useInjuryGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Injury.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Injury.getQuery>>, unknown, Awaited<ReturnType<typeof Injury.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useInjuryGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Injury.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Injury.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useInjuryGetOneKey = "InjuryGetOne";
export const useInjuryGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Injury.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Injury.getOne>>, unknown, Awaited<ReturnType<typeof Injury.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useInjuryGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Injury.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Injury.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useInjuryUpdateOne = <TData = Awaited<ReturnType<typeof Injury.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Injury.updateOne>>, unknown, {
    id: number;
    requestBody: Injury;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Injury.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Injury.updateOne>>, TError, {
    id: number;
    requestBody: Injury;
}, TContext>, "data"> & {
    data: TData;
};
export const useInjuryDeleteOne = <TData = Awaited<ReturnType<typeof Injury.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Injury.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Injury.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Injury.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useGoalCreate = <TData = Awaited<ReturnType<typeof Goal.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Goal.create>>, unknown, {
    requestBody: CreateGoalDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Goal.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Goal.create>>, TError, {
    requestBody: CreateGoalDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useGoalGetAllKey = "GoalGetAll";
export const useGoalGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Goal.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Goal.getAll>>, unknown, Awaited<ReturnType<typeof Goal.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useGoalGetAllKey, ...(queryKey ?? [])], queryFn: () => Goal.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Goal.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useGoalGetQueryKey = "GoalGetQuery";
export const useGoalGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Goal.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Goal.getQuery>>, unknown, Awaited<ReturnType<typeof Goal.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useGoalGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Goal.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Goal.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useGoalGetOneKey = "GoalGetOne";
export const useGoalGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Goal.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Goal.getOne>>, unknown, Awaited<ReturnType<typeof Goal.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useGoalGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Goal.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Goal.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useGoalUpdateOne = <TData = Awaited<ReturnType<typeof Goal.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Goal.updateOne>>, unknown, {
    id: number;
    requestBody: Goal;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Goal.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Goal.updateOne>>, TError, {
    id: number;
    requestBody: Goal;
}, TContext>, "data"> & {
    data: TData;
};
export const useGoalDeleteOne = <TData = Awaited<ReturnType<typeof Goal.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Goal.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Goal.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Goal.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useGenericTokenCreate = <TData = Awaited<ReturnType<typeof GenericToken.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof GenericToken.create>>, unknown, {
    requestBody: CreateGenericTokenDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => GenericToken.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof GenericToken.create>>, TError, {
    requestBody: CreateGenericTokenDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useGenericTokenGetAllKey = "GenericTokenGetAll";
export const useGenericTokenGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof GenericToken.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof GenericToken.getAll>>, unknown, Awaited<ReturnType<typeof GenericToken.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useGenericTokenGetAllKey, ...(queryKey ?? [])], queryFn: () => GenericToken.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof GenericToken.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useGenericTokenGetQueryKey = "GenericTokenGetQuery";
export const useGenericTokenGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof GenericToken.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof GenericToken.getQuery>>, unknown, Awaited<ReturnType<typeof GenericToken.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useGenericTokenGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => GenericToken.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof GenericToken.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useGenericTokenGetOneKey = "GenericTokenGetOne";
export const useGenericTokenGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof GenericToken.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof GenericToken.getOne>>, unknown, Awaited<ReturnType<typeof GenericToken.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useGenericTokenGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => GenericToken.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof GenericToken.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useGenericTokenUpdateOne = <TData = Awaited<ReturnType<typeof GenericToken.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof GenericToken.updateOne>>, unknown, {
    id: number;
    requestBody: GenericToken;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => GenericToken.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof GenericToken.updateOne>>, TError, {
    id: number;
    requestBody: GenericToken;
}, TContext>, "data"> & {
    data: TData;
};
export const useGenericTokenDeleteOne = <TData = Awaited<ReturnType<typeof GenericToken.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof GenericToken.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => GenericToken.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof GenericToken.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useFixtureRefereeCreate = <TData = Awaited<ReturnType<typeof FixtureReferee.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof FixtureReferee.create>>, unknown, {
    requestBody: CreateFixtureRefereeDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => FixtureReferee.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof FixtureReferee.create>>, TError, {
    requestBody: CreateFixtureRefereeDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useFixtureRefereeGetAllKey = "FixtureRefereeGetAll";
export const useFixtureRefereeGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof FixtureReferee.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof FixtureReferee.getAll>>, unknown, Awaited<ReturnType<typeof FixtureReferee.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useFixtureRefereeGetAllKey, ...(queryKey ?? [])], queryFn: () => FixtureReferee.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof FixtureReferee.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useFixtureRefereeGetQueryKey = "FixtureRefereeGetQuery";
export const useFixtureRefereeGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof FixtureReferee.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof FixtureReferee.getQuery>>, unknown, Awaited<ReturnType<typeof FixtureReferee.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useFixtureRefereeGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => FixtureReferee.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof FixtureReferee.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useFixtureRefereeGetOneKey = "FixtureRefereeGetOne";
export const useFixtureRefereeGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof FixtureReferee.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof FixtureReferee.getOne>>, unknown, Awaited<ReturnType<typeof FixtureReferee.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useFixtureRefereeGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => FixtureReferee.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof FixtureReferee.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useFixtureRefereeUpdateOne = <TData = Awaited<ReturnType<typeof FixtureReferee.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof FixtureReferee.updateOne>>, unknown, {
    id: number;
    requestBody: FixtureReferee;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => FixtureReferee.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof FixtureReferee.updateOne>>, TError, {
    id: number;
    requestBody: FixtureReferee;
}, TContext>, "data"> & {
    data: TData;
};
export const useFixtureRefereeDeleteOne = <TData = Awaited<ReturnType<typeof FixtureReferee.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof FixtureReferee.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => FixtureReferee.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof FixtureReferee.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useFixtureCreate = <TData = Awaited<ReturnType<typeof Fixture.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Fixture.create>>, unknown, {
    requestBody: CreateFixtureDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Fixture.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Fixture.create>>, TError, {
    requestBody: CreateFixtureDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useFixtureGetAllKey = "FixtureGetAll";
export const useFixtureGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Fixture.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Fixture.getAll>>, unknown, Awaited<ReturnType<typeof Fixture.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useFixtureGetAllKey, ...(queryKey ?? [])], queryFn: () => Fixture.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Fixture.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useFixtureGetQueryKey = "FixtureGetQuery";
export const useFixtureGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Fixture.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Fixture.getQuery>>, unknown, Awaited<ReturnType<typeof Fixture.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useFixtureGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Fixture.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Fixture.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useFixtureGetOneKey = "FixtureGetOne";
export const useFixtureGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Fixture.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Fixture.getOne>>, unknown, Awaited<ReturnType<typeof Fixture.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useFixtureGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Fixture.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Fixture.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useFixtureUpdateOne = <TData = Awaited<ReturnType<typeof Fixture.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Fixture.updateOne>>, unknown, {
    id: number;
    requestBody: Fixture;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Fixture.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Fixture.updateOne>>, TError, {
    id: number;
    requestBody: Fixture;
}, TContext>, "data"> & {
    data: TData;
};
export const useFixtureDeleteOne = <TData = Awaited<ReturnType<typeof Fixture.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Fixture.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Fixture.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Fixture.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useCompetitionCreate = <TData = Awaited<ReturnType<typeof Competition.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Competition.create>>, unknown, {
    requestBody: CreateCompetitionDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Competition.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Competition.create>>, TError, {
    requestBody: CreateCompetitionDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useCompetitionGetAllKey = "CompetitionGetAll";
export const useCompetitionGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Competition.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Competition.getAll>>, unknown, Awaited<ReturnType<typeof Competition.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useCompetitionGetAllKey, ...(queryKey ?? [])], queryFn: () => Competition.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Competition.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useCompetitionGetQueryKey = "CompetitionGetQuery";
export const useCompetitionGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Competition.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Competition.getQuery>>, unknown, Awaited<ReturnType<typeof Competition.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useCompetitionGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Competition.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Competition.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useCompetitionGetOneKey = "CompetitionGetOne";
export const useCompetitionGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Competition.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Competition.getOne>>, unknown, Awaited<ReturnType<typeof Competition.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useCompetitionGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Competition.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Competition.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useCompetitionUpdateOne = <TData = Awaited<ReturnType<typeof Competition.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Competition.updateOne>>, unknown, {
    id: number;
    requestBody: Competition;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Competition.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Competition.updateOne>>, TError, {
    id: number;
    requestBody: Competition;
}, TContext>, "data"> & {
    data: TData;
};
export const useCompetitionDeleteOne = <TData = Awaited<ReturnType<typeof Competition.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Competition.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Competition.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Competition.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useCardCreate = <TData = Awaited<ReturnType<typeof Card.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Card.create>>, unknown, {
    requestBody: CreateCardDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Card.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Card.create>>, TError, {
    requestBody: CreateCardDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useCardGetAllKey = "CardGetAll";
export const useCardGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Card.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Card.getAll>>, unknown, Awaited<ReturnType<typeof Card.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useCardGetAllKey, ...(queryKey ?? [])], queryFn: () => Card.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Card.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useCardGetQueryKey = "CardGetQuery";
export const useCardGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Card.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Card.getQuery>>, unknown, Awaited<ReturnType<typeof Card.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useCardGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Card.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Card.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useCardGetOneKey = "CardGetOne";
export const useCardGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Card.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Card.getOne>>, unknown, Awaited<ReturnType<typeof Card.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useCardGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Card.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Card.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useCardUpdateOne = <TData = Awaited<ReturnType<typeof Card.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Card.updateOne>>, unknown, {
    id: number;
    requestBody: Card;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Card.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Card.updateOne>>, TError, {
    id: number;
    requestBody: Card;
}, TContext>, "data"> & {
    data: TData;
};
export const useCardDeleteOne = <TData = Awaited<ReturnType<typeof Card.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Card.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Card.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Card.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
export const useAuthAuthControllerLogin = <TData = Awaited<ReturnType<typeof Auth.authControllerLogin>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Auth.authControllerLogin>>, unknown, {
    requestBody: LoginBody;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Auth.authControllerLogin(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Auth.authControllerLogin>>, TError, {
    requestBody: LoginBody;
}, TContext>, "data"> & {
    data: TData;
};
export const useAuthAuthControllerRegister = <TData = Awaited<ReturnType<typeof Auth.authControllerRegister>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Auth.authControllerRegister>>, unknown, {
    requestBody: RegisterBody;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Auth.authControllerRegister(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Auth.authControllerRegister>>, TError, {
    requestBody: RegisterBody;
}, TContext>, "data"> & {
    data: TData;
};
export const useAddressCreate = <TData = Awaited<ReturnType<typeof Address.create>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Address.create>>, unknown, {
    requestBody: CreateAddressDTO;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ requestBody }) => Address.create(requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Address.create>>, TError, {
    requestBody: CreateAddressDTO;
}, TContext>, "data"> & {
    data: TData;
};
export const useAddressGetAllKey = "AddressGetAll";
export const useAddressGetAll = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Address.getAll>>, TError = unknown>(queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Address.getAll>>, unknown, Awaited<ReturnType<typeof Address.getAll>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useAddressGetAllKey, ...(queryKey ?? [])], queryFn: () => Address.getAll(), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Address.getAll>>, TError>, "data"> & {
    data: TData;
};
export const useAddressGetQueryKey = "AddressGetQuery";
export const useAddressGetQuery = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Address.getQuery>>, TError = unknown>({ skip, take, withDeleted, loadEagerRelations, transaction, comment }: {
    skip: number;
    take: number;
    withDeleted: boolean;
    loadEagerRelations: boolean;
    transaction: boolean;
    comment: string;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Address.getQuery>>, unknown, Awaited<ReturnType<typeof Address.getQuery>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useAddressGetQueryKey, ...(queryKey ?? [{ skip, take, withDeleted, loadEagerRelations, transaction, comment }])], queryFn: () => Address.getQuery(skip, take, withDeleted, loadEagerRelations, transaction, comment), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Address.getQuery>>, TError>, "data"> & {
    data: TData;
};
export const useAddressGetOneKey = "AddressGetOne";
export const useAddressGetOne = <TQueryKey extends Array<unknown> = unknown[], TData = Awaited<ReturnType<typeof Address.getOne>>, TError = unknown>({ id }: {
    id: number;
}, queryKey?: TQueryKey, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof Address.getOne>>, unknown, Awaited<ReturnType<typeof Address.getOne>>, unknown[]>, "queryKey" | "queryFn" | "initialData">) => useQuery({ queryKey: [useAddressGetOneKey, ...(queryKey ?? [{ id }])], queryFn: () => Address.getOne(id), ...options }) as Omit<UseQueryResult<Awaited<ReturnType<typeof Address.getOne>>, TError>, "data"> & {
    data: TData;
};
export const useAddressUpdateOne = <TData = Awaited<ReturnType<typeof Address.updateOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Address.updateOne>>, unknown, {
    id: number;
    requestBody: Address;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id, requestBody }) => Address.updateOne(id, requestBody), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Address.updateOne>>, TError, {
    id: number;
    requestBody: Address;
}, TContext>, "data"> & {
    data: TData;
};
export const useAddressDeleteOne = <TData = Awaited<ReturnType<typeof Address.deleteOne>>, TError = unknown, TContext = unknown>(options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof Address.deleteOne>>, unknown, {
    id: number;
}, unknown>, "mutationFn">) => useMutation({ mutationFn: ({ id }) => Address.deleteOne(id), ...options }) as Omit<UseMutationResult<Awaited<ReturnType<typeof Address.deleteOne>>, TError, {
    id: number;
}, TContext>, "data"> & {
    data: TData;
};
