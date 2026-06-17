import React, { useEffect, useState } from 'react';
import { Avatar, Collapse, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { UiBadge, UiLiveBadge } from './Badge';
import classes from './MatchList.module.css';

export interface MatchRowData {
  id: string | number;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeLogo?: string;
  awayLogo?: string;
  time?: string;
  isLive?: boolean;
  hasTickets?: boolean;
}

interface MatchRowProps {
  match: MatchRowData;
  onClick?: (id: string | number) => void;
}

function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function TeamCrest({ name, logo }: { name: string; logo?: string }) {
  return (
    <Avatar src={logo} size={28} radius="xl" className={classes.crest}>
      <Text fz={10} fw={700}>
        {teamInitials(name)}
      </Text>
    </Avatar>
  );
}

export function UiMatchRow({ match, onClick }: MatchRowProps) {
  const hasScore = match.homeScore != null && match.awayScore != null;
  const centerPrimary = hasScore
    ? `${match.homeScore} - ${match.awayScore}`
    : (match.time ?? '–');
  const centerSecondary = hasScore ? match.time : undefined;
  const isLive = match.isLive ?? false;
  const isFinished = match.time === 'FT' || (hasScore && !isLive);
  const showTickets = !!match.hasTickets && !isFinished;
  const showMeta = isLive || showTickets;

  const handleActivate = () => onClick?.(match.id);

  return (
    <div className={classes.matchRowWrap}>
      {showMeta && (
        <div className={classes.matchMeta}>
          {isLive && <UiLiveBadge />}
          {showTickets && (
            <UiBadge size="sm" color="green">
              Tickets
            </UiBadge>
          )}
        </div>
      )}
      <div
        className={classes.matchRow}
        onClick={handleActivate}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') handleActivate();
              }
            : undefined
        }
      >
        <div className={classes.teamSide}>
          <TeamCrest name={match.homeTeam} logo={match.homeLogo} />
          <span className={classes.teamName}>{match.homeTeam}</span>
        </div>

        <div className={classes.centerBlock}>
          <span className={hasScore ? classes.score : classes.kickoff}>{centerPrimary}</span>
          {centerSecondary && (
            <span className={`${classes.time} ${isLive ? classes.timeLive : ''}`}>
              {centerSecondary}
            </span>
          )}
        </div>

        <div className={`${classes.teamSide} ${classes.teamSideRight}`}>
          <TeamCrest name={match.awayTeam} logo={match.awayLogo} />
          <span className={classes.teamName}>{match.awayTeam}</span>
        </div>
      </div>
    </div>
  );
}

interface LeagueGroup {
  league: string;
  matches: MatchRowData[];
}

interface MatchListProps {
  groups: LeagueGroup[];
  onMatchClick?: (id: string | number) => void;
  /** When false, groups stay open and headers are not clickable. Default true. */
  collapsible?: boolean;
  /** Initial open state for groups. Default true (all expanded). */
  defaultExpanded?: boolean;
}

export function UiMatchList({
  groups,
  onMatchClick,
  collapsible = true,
  defaultExpanded = true,
}: MatchListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.league, defaultExpanded])),
  );

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      groups.forEach((g) => {
        if (!(g.league in next)) {
          next[g.league] = defaultExpanded;
        }
      });
      return next;
    });
  }, [groups, defaultExpanded]);

  const toggleGroup = (league: string) => {
    if (!collapsible) return;
    setExpanded((prev) => ({ ...prev, [league]: !prev[league] }));
  };

  return (
    <div className={classes.matchListStack}>
      {groups.map((group) => {
        const isOpen = collapsible ? (expanded[group.league] ?? defaultExpanded) : true;

        return (
          <div
            key={group.league}
            className={`${classes.matchList} ${isOpen ? classes.matchListOpen : classes.matchListCollapsed}`}
          >
            <button
              type="button"
              className={`${classes.leagueHeader} ${isOpen ? classes.leagueHeaderOpen : ''}`}
              onClick={() => toggleGroup(group.league)}
              aria-expanded={isOpen}
              disabled={!collapsible}
            >
              <span className={classes.leagueName}>{group.league}</span>
              <span className={classes.leagueHeaderEnd}>
                <span className={classes.leagueCount}>{group.matches.length}</span>
                {collapsible && (
                  <IconChevronRight
                    size={16}
                    stroke={2}
                    className={`${classes.chevron} ${isOpen ? classes.chevronOpen : ''}`}
                    aria-hidden
                  />
                )}
              </span>
            </button>
            <Collapse in={isOpen}>
              <div className={classes.matchGroupBody}>
                {group.matches.map((match) => (
                  <UiMatchRow key={match.id} match={match} onClick={onMatchClick} />
                ))}
              </div>
            </Collapse>
          </div>
        );
      })}
    </div>
  );
}
