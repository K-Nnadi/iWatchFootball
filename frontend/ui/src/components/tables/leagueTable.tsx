import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { IconChevronUp, IconChevronDown, IconMinus, IconSelector } from '@tabler/icons-react';
import { Center, Group, ScrollArea, Table, Text, UnstyledButton } from '@mantine/core';

interface Team {
    id: number;
    position: number;
    name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalDifference: number;
    points: number;
    previousPosition: number;
}

const initialTeams: Team[] = [
    { id: 1, position: 1, name: 'Manchester City', played: 25, won: 19, drawn: 4, lost: 2, goalDifference: 38, points: 61, previousPosition: 2 },
    { id: 2, position: 2, name: 'Arsenal', played: 25, won: 18, drawn: 5, lost: 2, goalDifference: 35, points: 59, previousPosition: 1 },
    { id: 3, position: 3, name: 'Liverpool', played: 25, won: 17, drawn: 6, lost: 2, goalDifference: 30, points: 57, previousPosition: 3 },
    { id: 4, position: 4, name: 'Chelsea', played: 25, won: 15, drawn: 6, lost: 4, goalDifference: 20, points: 51, previousPosition: 4 },
    { id: 5, position: 5, name: 'Tottenham', played: 25, won: 14, drawn: 5, lost: 6, goalDifference: 18, points: 47, previousPosition: 5 },
];

function PositionChangeIcon({ position, previousPosition }: { position: number; previousPosition: number }) {
    if (position < previousPosition) {
        return <IconChevronUp color="green" size={16} />;
    } else if (position > previousPosition) {
        return <IconChevronDown color="red" size={16} />;
    }
    return <IconMinus color="gray" size={16} />;
}

function Th({ children, sortKey, sortBy, reversed, onSort }: { children: React.ReactNode; sortKey: keyof Team; sortBy: keyof Team | null; reversed: boolean; onSort: (key: keyof Team) => void }) {
    const isSorted = sortBy === sortKey;
    const Icon = isSorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
    return (
        <Table.Th>
            <UnstyledButton onClick={() => onSort(sortKey)}>
                <Group justify="space-between">
                    <Text fw={500} fz="sm">
                        {children}
                    </Text>
                    <Center>
                        <Icon size={16} stroke={1.5} />
                    </Center>
                </Group>
            </UnstyledButton>
        </Table.Th>
    );
}

export function LeagueTable() {
    const [teams, setTeams] = useState(initialTeams);
    const [sortBy, setSortBy] = useState<keyof Team | null>(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    const navigate = useNavigate(); // Initialize useNavigate hook

    const setSorting = (field: keyof Team) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);

        const sortedTeams = [...teams].sort((a, b) => {
            if (typeof a[field] === 'number' && typeof b[field] === 'number') {
                return reversed ? (b[field] as number) - (a[field] as number) : (a[field] as number) - (b[field] as number);
            }
            return reversed ? b[field].toString().localeCompare(a[field].toString()) : a[field].toString().localeCompare(b[field].toString());
        });

        setTeams(sortedTeams);
    };

    const handleTeamClick = (id: number) => {
        // Navigate to the page of the clicked team
        navigate(`/team/${id}`);
    };

    return (
        <ScrollArea>
            <Table horizontalSpacing="lg" verticalSpacing="sm" miw={700} layout="fixed" highlightOnHover withRowBorders={false}>
                <Table.Thead>
                    <Table.Tr>
                        <Th sortKey="position" sortBy={sortBy} reversed={reverseSortDirection} onSort={setSorting}>#</Th>
                        <Th sortKey="name" sortBy={sortBy} reversed={reverseSortDirection} onSort={setSorting} style={{ width: '50%' }}>Team</Th>
                        <Th sortKey="played" sortBy={sortBy} reversed={reverseSortDirection} onSort={setSorting}>P</Th>
                        <Th sortKey="won" sortBy={sortBy} reversed={reverseSortDirection} onSort={setSorting}>W</Th>
                        <Th sortKey="drawn" sortBy={sortBy} reversed={reverseSortDirection} onSort={setSorting}>D</Th>
                        <Th sortKey="lost" sortBy={sortBy} reversed={reverseSortDirection} onSort={setSorting}>L</Th>
                        <Th sortKey="goalDifference" sortBy={sortBy} reversed={reverseSortDirection} onSort={setSorting}>GD</Th>
                        <Th sortKey="points" sortBy={sortBy} reversed={reverseSortDirection} onSort={setSorting} style={{ fontWeight: 800 }}>Pts</Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {teams.map((team) => (
                        <Table.Tr key={team.id}>
                            <Table.Td>
                                <Group gap={6}>
                                    {team.position} <PositionChangeIcon position={team.position} previousPosition={team.previousPosition} />
                                </Group>
                            </Table.Td>
                            <Table.Td
                                style={{ fontWeight: 800, width: '50%' }}
                                onClick={() => handleTeamClick(team.id)} // Handle the click event
                            >
                                {team.name}
                            </Table.Td>
                            <Table.Td>{team.played}</Table.Td>
                            <Table.Td>{team.won}</Table.Td>
                            <Table.Td>{team.drawn}</Table.Td>
                            <Table.Td>{team.lost}</Table.Td>
                            <Table.Td>{team.goalDifference}</Table.Td>
                            <Table.Td style={{ fontWeight: 800 }}>{team.points}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    );
}
