import React, {useState, useEffect, useMemo} from 'react';
import {
    Box,
    Container,
    Group,
    Text,
    Button,
    Slider,
    Select,
    Paper,
    Badge,
    Stack,
    Grid,
    Image,
    ActionIcon,
    ScrollArea,
    Radio,
    Collapse,
} from '@mantine/core';
import {IconInfoCircle, IconPrinter, IconCamera, IconChevronDown, IconChevronUp} from '@tabler/icons-react';
import {useParams, useLocation} from 'react-router-dom';
import {usePageTransition} from '../hooks/usePageTransition';
import {StadiumMap} from '../components/stadium/StadiumMap';
import {ModernButton, ModernH1, ModernH3, ModernBody} from '../components/modern';
import './seatSelection.page.css';

interface Ticket {
    id: string;
    category: number;
    block?: string;
    row?: string;
    seatsTogether: number;
    ticketType: 'Single Seats' | 'Up To 2 Seats Together' | 'Up To 4 Seats Together';
    fanSide?: 'Home' | 'Away' | 'Neutral';
    ticketFormat: 'E-Ticket' | 'Print at Home';
    price: number;
    available: number;
    clearView: boolean;
    adultTickets: boolean;
}

interface StadiumSection {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    category: number;
    available: number;
    price: number;
    highlighted?: boolean;
}

export function SeatSelectionPage() {
    const {navigateWithTransition} = usePageTransition();
    const {matchId} = useParams<{ matchId: string }>();
    const routerLocation = useLocation();

    const matchDetails = routerLocation.state || {
        homeTeam: 'Inter Milan',
        awayTeam: 'AC Milan',
        homeTeamId: 3,
        awayTeamId: 4,
        homeTeamLogo: 'https://logos-world.net/wp-content/uploads/2020/06/Inter-Milan-Logo.png',
        awayTeamLogo: 'https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png',
        date: '2025-01-25T18:00:00',
        venue: 'San Siro',
    };

    // Filters
    const [priceRange, setPriceRange] = useState<[number, number]>([229, 498]);
    const [ticketType, setTicketType] = useState<string | null>(null);
    const [blockLocation, setBlockLocation] = useState<string | null>(null);
    const [quantity, setQuantity] = useState<string | null>(null);
    const [splitType, setSplitType] = useState<string | null>(null);
    const [fanSide, setFanSide] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'zone' | 'block'>('zone');
    const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>();
    const [filtersOpen, setFiltersOpen] = useState(true);

    // Mock tickets data
    const [allTickets, setAllTickets] = useState<Ticket[]>([
        {
            id: '1',
            category: 4,
            block: '334',
            seatsTogether: 2,
            ticketType: 'Up To 2 Seats Together',
            ticketFormat: 'E-Ticket',
            price: 231.23,
            available: 15,
            clearView: true,
            adultTickets: true,
        },
        {
            id: '2',
            category: 4,
            block: '327',
            seatsTogether: 1,
            ticketType: 'Single Seats',
            ticketFormat: 'E-Ticket',
            price: 245.50,
            available: 8,
            clearView: true,
            adultTickets: true,
        },
        {
            id: '3',
            category: 3,
            block: '218',
            seatsTogether: 4,
            ticketType: 'Up To 4 Seats Together',
            fanSide: 'Home',
            ticketFormat: 'E-Ticket',
            price: 374.33,
            available: 20,
            clearView: true,
            adultTickets: true,
        },
        {
            id: '4',
            category: 1,
            block: '101',
            seatsTogether: 2,
            ticketType: 'Up To 2 Seats Together',
            fanSide: 'Home',
            ticketFormat: 'E-Ticket',
            price: 485.00,
            available: 5,
            clearView: true,
            adultTickets: true,
        },
        {
            id: '5',
            category: 2,
            block: '201',
            seatsTogether: 2,
            ticketType: 'Up To 2 Seats Together',
            ticketFormat: 'Print at Home',
            price: 420.75,
            available: 12,
            clearView: true,
            adultTickets: true,
        },
    ]);

    // Mock stadium sections
    const [stadiumSections, setStadiumSections] = useState<StadiumSection[]>([
        // Lower tier sections
        {id: '101', label: '101', x: 150, y: 350, width: 40, height: 30, category: 1, available: 5, price: 485},
        {id: '102', label: '102', x: 200, y: 350, width: 40, height: 30, category: 1, available: 8, price: 485},
        {id: '103', label: '103', x: 250, y: 350, width: 40, height: 30, category: 1, available: 3, price: 485},
        {id: '104', label: '104', x: 300, y: 350, width: 40, height: 30, category: 1, available: 0, price: 485},
        {id: '105', label: '105', x: 350, y: 350, width: 40, height: 30, category: 1, available: 2, price: 485},
        {id: '106', label: '106', x: 400, y: 350, width: 40, height: 30, category: 1, available: 0, price: 485},
        {id: '107', label: '107', x: 450, y: 350, width: 40, height: 30, category: 1, available: 4, price: 485},
        {id: '108', label: '108', x: 500, y: 350, width: 40, height: 30, category: 1, available: 6, price: 485},
        {id: '109', label: '109', x: 550, y: 350, width: 40, height: 30, category: 1, available: 7, price: 485},
        {id: '110', label: '110', x: 600, y: 350, width: 40, height: 30, category: 1, available: 3, price: 485},
        {id: '111', label: '111', x: 150, y: 420, width: 40, height: 30, category: 1, available: 5, price: 485},
        {id: '112', label: '112', x: 200, y: 420, width: 40, height: 30, category: 1, available: 8, price: 485},

        // Middle tier sections
        {id: '201', label: '201', x: 150, y: 250, width: 35, height: 25, category: 2, available: 12, price: 420},
        {
            id: '218',
            label: '218',
            x: 250,
            y: 250,
            width: 35,
            height: 25,
            category: 3,
            available: 20,
            price: 374,
            highlighted: true
        },
        {id: '219', label: '219', x: 300, y: 250, width: 35, height: 25, category: 3, available: 15, price: 374},
        {id: '220', label: '220', x: 350, y: 250, width: 35, height: 25, category: 3, available: 18, price: 374},
        {id: '241', label: '241', x: 450, y: 250, width: 35, height: 25, category: 3, available: 10, price: 374},
        {id: '242', label: '242', x: 500, y: 250, width: 35, height: 25, category: 3, available: 12, price: 374},
        {id: '276', label: '276', x: 600, y: 250, width: 35, height: 25, category: 2, available: 8, price: 420},

        // Upper tier sections
        {id: '315', label: '315', x: 200, y: 150, width: 30, height: 20, category: 3, available: 25, price: 374},
        {id: '320', label: '320', x: 300, y: 150, width: 30, height: 20, category: 3, available: 30, price: 374},
        {id: '327', label: '327', x: 400, y: 150, width: 30, height: 20, category: 4, available: 8, price: 245},
        {id: '334', label: '334', x: 500, y: 150, width: 30, height: 20, category: 4, available: 15, price: 231},
        {id: '345', label: '345', x: 550, y: 150, width: 30, height: 20, category: 3, available: 20, price: 374},
    ]);

    // Filter tickets based on filters
    const filteredTickets = useMemo(() => {
        return allTickets.filter((ticket) => {
            if (ticket.price < priceRange[0] || ticket.price > priceRange[1]) return false;
            if (ticketType && ticket.ticketType !== ticketType) return false;
            if (blockLocation && ticket.block !== blockLocation) return false;
            if (quantity && ticket.seatsTogether.toString() !== quantity) return false;
            if (fanSide && ticket.fanSide !== fanSide) return false;
            return true;
        });
    }, [allTickets, priceRange, ticketType, blockLocation, quantity, fanSide]);

    const handleResetFilters = () => {
        setPriceRange([229, 498]);
        setTicketType(null);
        setBlockLocation(null);
        setQuantity(null);
        setSplitType(null);
        setFanSide(null);
    };

    const handleSectionClick = (sectionId: string) => {
        setSelectedSectionId(sectionId);
        // Filter tickets by block if in block view
        if (viewMode === 'block') {
            setBlockLocation(sectionId);
        }
    };

    const handleBuyNow = (ticketId: string) => {
        const ticket = allTickets.find((t) => t.id === ticketId);
        if (ticket) {
            navigateWithTransition('/checkout', {
                state: {
                    matchId: matchId || 'unknown',
                    homeTeam: matchDetails.homeTeam,
                    awayTeam: matchDetails.awayTeam,
                    date: matchDetails.date,
                    venue: matchDetails.venue,
                    price: ticket.price,
                    ticket: ticket,
                },
            });
        }
    };

    const minPrice = Math.min(...allTickets.map((t) => t.price));
    const maxPrice = Math.max(...allTickets.map((t) => t.price));

    return (
        <Box className="dark-theme seat-selection-page" style={{minHeight: '100vh', padding: '2rem 0'}}>
            <Container size="xl">
                {/* Match Header */}
                <Paper 
                    p="xl" 
                    mb="lg" 
                    style={{ 
                        backgroundColor: 'var(--modern-dark-gray)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background decorative elements */}
                    <Box
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '200px',
                            height: '200px',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
                            borderRadius: '0 0 100% 0',
                        }}
                    />
                    <Box
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '200px',
                            height: '200px',
                            background: 'linear-gradient(225deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
                            borderRadius: '0 0 0 100%',
                        }}
                    />

                    <Stack spacing="lg" align="center" style={{ position: 'relative', zIndex: 1 }}>
                        {/* Competition/Event Badge */}
                        <Badge
                            size="lg"
                            variant="outline"
                            style={{
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                backgroundColor: 'transparent',
                                color: 'var(--modern-white)',
                                padding: '0.5rem 1rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontWeight: 600,
                            }}
                        >
                            {matchDetails.competition || 'Match'}
                        </Badge>

                        {/* Date and Time */}
                        <Stack spacing={4} align="center">
                            <Text
                                size="xl"
                                weight={900}
                                style={{
                                    color: 'var(--modern-white)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                                }}
                            >
                                {new Date(matchDetails.date).toLocaleDateString('en-GB', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                }).toUpperCase()}
                            </Text>
                            <Text
                                size="md"
                                weight={600}
                                style={{
                                    color: 'var(--modern-white)',
                                    fontSize: '1.25rem',
                                }}
                            >
                                {new Date(matchDetails.date).toLocaleTimeString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                })}
                            </Text>
                        </Stack>

                        {/* Teams */}
                        <Group position="apart" style={{ width: '100%', maxWidth: '600px' }} align="flex-end">
                            {/* Home Team */}
                            <Stack spacing="sm" align="center" style={{ flex: 1 }}>
                                <Box
                                    onClick={() => matchDetails.homeTeamId && navigateWithTransition(`/team/${matchDetails.homeTeamId}`)}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '2px solid rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'var(--modern-black)',
                                        cursor: matchDetails.homeTeamId ? 'pointer' : 'default',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (matchDetails.homeTeamId) {
                                            e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (matchDetails.homeTeamId) {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }
                                    }}
                                >
                                    <Image
                                        src={matchDetails.homeTeamLogo}
                                        width={70}
                                        height={70}
                                        fit="contain"
                                        style={{ borderRadius: '50%' }}
                                    />
                                </Box>
                                <Text
                                    size="md"
                                    weight={700}
                                    style={{
                                        color: 'var(--modern-white)',
                                        textAlign: 'center',
                                    }}
                                >
                                    {matchDetails.homeTeam}
                                </Text>
                            </Stack>

                            {/* VS Divider */}
                            <Text
                                size="xl"
                                weight={900}
                                style={{
                                    color: 'var(--modern-lime)',
                                    marginBottom: '1rem',
                                }}
                            >
                                VS
                            </Text>

                            {/* Away Team */}
                            <Stack spacing="sm" align="center" style={{ flex: 1 }}>
                                <Box
                                    onClick={() => matchDetails.awayTeamId && navigateWithTransition(`/team/${matchDetails.awayTeamId}`)}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '2px solid rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'var(--modern-black)',
                                        cursor: matchDetails.awayTeamId ? 'pointer' : 'default',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (matchDetails.awayTeamId) {
                                            e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (matchDetails.awayTeamId) {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }
                                    }}
                                >
                                    <Image
                                        src={matchDetails.awayTeamLogo}
                                        width={70}
                                        height={70}
                                        fit="contain"
                                        style={{ borderRadius: '50%' }}
                                    />
                                </Box>
                                <Text
                                    size="md"
                                    weight={700}
                                    style={{
                                        color: 'var(--modern-white)',
                                        textAlign: 'center',
                                    }}
                                >
                                    {matchDetails.awayTeam}
                                </Text>
                            </Stack>
                        </Group>

                        {/* Venue */}
                        <Text
                            size="sm"
                            style={{
                                color: 'var(--modern-gray)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                            }}
                        >
                            {matchDetails.venue}
                </Text>
                    </Stack>
            </Paper>

                {/* Filters */}
                <Paper p="md" mb="lg" style={{
                    backgroundColor: 'var(--modern-dark-gray)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <Group position="apart" mb="md">
                        <Text size="md" weight={600} style={{color: 'var(--modern-white)'}}>
                            Filters
                        </Text>
                        <ActionIcon
                            variant="subtle"
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            style={{color: 'var(--modern-white)'}}
                        >
                            {filtersOpen ? <IconChevronUp size={20}/> : <IconChevronDown size={20}/>}
                        </ActionIcon>
                    </Group>
                    <Collapse in={filtersOpen}>
                        <Grid gutter="md">
                            <Grid.Col span={{base: 12, sm: 6, md: 2.4}}>
                                <Group position="apart" mb="xs">
                                    <Text size="sm" weight={500} style={{color: 'var(--modern-white)'}}>
                                        Price
                                    </Text>
                                    <Text size="xs" style={{color: 'var(--modern-gray)'}}>
                                        £{priceRange[0]} - £{priceRange[1]}
                </Text>
                                </Group>
                                <Slider
                                    value={priceRange[1]}
                                    onChange={(value) => setPriceRange([priceRange[0], value])}
                                    min={minPrice}
                                    max={maxPrice}
                                    marks={[
                                        {value: minPrice, label: `£${minPrice}`},
                                        {value: maxPrice, label: `£${maxPrice}`},
                                    ]}
                                />
                            </Grid.Col>
                            <Grid.Col span={{base: 12, sm: 6, md: 1.9}}>
                                <Select
                                    label="Ticket Type"
                                    placeholder="All"
                                    data={['Single Seats', 'Up To 2 Seats Together', 'Up To 4 Seats Together']}
                                    value={ticketType}
                                    onChange={setTicketType}
                                />
                            </Grid.Col>
                            <Grid.Col span={{base: 12, sm: 6, md: 1.9}}>
                                <Select
                                    label="Location"
                                    placeholder="All"
                                    data={Array.from(new Set(allTickets.map((t) => t.block).filter(Boolean)))}
                                    value={blockLocation}
                                    onChange={setBlockLocation}
                                />
                            </Grid.Col>
                            <Grid.Col span={{base: 12, sm: 6, md: 1.9}}>
                                <Select
                                    label="Quantity"
                                    placeholder="All"
                                    data={['1', '2', '3', '4']}
                                    value={quantity}
                                    onChange={setQuantity}
                                />
                            </Grid.Col>
                            <Grid.Col span={{base: 12, sm: 6, md: 1.9}}>
                                <Select
                                    label="Split Type"
                                    placeholder="All"
                                    data={['Together', 'Split']}
                                    value={splitType}
                                    onChange={setSplitType}
                                />
                            </Grid.Col>
                            <Grid.Col span={{base: 12, sm: 6, md: 1.9}}>
                                <Select
                                    label="Fan Side"
                                    placeholder="All"
                                    data={['Home', 'Away', 'Neutral']}
                                    value={fanSide}
                                    onChange={setFanSide}
                                />
                            </Grid.Col>
                            <Grid.Col span={{base: 12, sm: 6, md: 0.5}}>
                                <Button
                                    variant="filled"
                                    color="red"
                                    fullWidth
                                    mt="xl"
                                    onClick={handleResetFilters}
                                >
                                    Reset All
                                </Button>
                            </Grid.Col>
                        </Grid>
                    </Collapse>
            </Paper>

                {/* Main Content: Stadium Map and Ticket List */}
                <Grid gutter="lg">
                    {/* Stadium Map */}
                    <Grid.Col span={{base: 12, lg: 8}}>
                        <StadiumMap
                            sections={stadiumSections}
                            onSectionClick={handleSectionClick}
                            selectedSectionId={selectedSectionId}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />
                    </Grid.Col>

                    {/* Ticket Listing */}
                    <Grid.Col span={{base: 12, lg: 4}}>
                        <Paper
                            p="md"
                            style={{
                                backgroundColor: 'var(--modern-dark-gray)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                height: '600px',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Group position="apart" mb="md">
                                <ModernH3 style={{color: 'var(--modern-white)', margin: 0}}>
                                    Available Tickets
                                </ModernH3>
                                <Text size="xs" style={{color: 'var(--modern-gray)'}}>
                                    Price includes all fees
                                </Text>
                            </Group>

                            <ScrollArea style={{flex: 1}}>
                                <Stack spacing="md">
                                    {filteredTickets.map((ticket) => (
                                        <Paper
                                            key={ticket.id}
                                            p="md"
                                            style={{
                                                backgroundColor: 'var(--modern-black)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            }}
                                        >
                                            <Group position="apart" mb="xs">
                                                <Badge
                                                    color={
                                                        ticket.category === 1
                                                            ? 'red'
                                                            : ticket.category === 2
                                                                ? 'orange'
                                                                : ticket.category === 3
                                                                    ? 'blue'
                                                                    : 'gray'
                                                    }
                                                >
                                                    Category {ticket.category}
                                                </Badge>
                                                <Group spacing="xs">
                                                    <ActionIcon size="sm" variant="subtle">
                                                        <IconInfoCircle size={16}/>
                                                    </ActionIcon>
                                                    <ActionIcon size="sm" variant="subtle">
                                                        <IconPrinter size={16}/>
                                                    </ActionIcon>
                                                    <ActionIcon size="sm" variant="subtle">
                                                        <IconCamera size={16}/>
                                                    </ActionIcon>
                                                </Group>
                        </Group>

                                            <Stack spacing="xs">
                                                {ticket.row && (
                                                    <Text size="xs" style={{color: 'var(--modern-gray)'}}>
                                                        Row: {ticket.row}
                                                    </Text>
                                                )}
                                                <Text size="sm" style={{color: 'var(--modern-white)'}}>
                                                    {ticket.ticketType}
                                                </Text>
                                                {ticket.fanSide && (
                                                    <Text size="xs" style={{color: 'var(--modern-gray)'}}>
                                                        {ticket.fanSide} Fans
                                                    </Text>
                                                )}
                                                {ticket.block && (
                                                    <Text size="xs" style={{color: 'var(--modern-gray)'}}>
                                                        Block: {ticket.block}
                                                    </Text>
                                                )}
                                                {ticket.clearView && (
                                                    <Badge size="xs" variant="light" color="green">
                                                        Clear View
                                                    </Badge>
                                                )}
                                                {ticket.adultTickets && (
                                                    <Text size="xs" style={{color: 'var(--modern-gray)'}}>
                                                        Adult Tickets
                        </Text>
                                                )}

                                                <Group position="apart" mt="sm">
                                                    <Select
                                                        placeholder="Qty"
                                                        data={Array.from({length: Math.min(ticket.available, 10)}, (_, i) => ({
                                                            value: (i + 1).toString(),
                                                            label: (i + 1).toString(),
                                                        }))}
                                                        defaultValue="1"
                                                        size="xs"
                                                        style={{width: 80}}
                                                    />
                                                    <Text size="lg" weight={700} style={{color: 'var(--modern-lime)'}}>
                                                        £{ticket.price.toFixed(2)} per ticket
                                                    </Text>
            </Group>

                                                <ModernButton
                    fullWidth
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleBuyNow(ticket.id)}
                                                >
                                                    Buy Now
                                                </ModernButton>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </ScrollArea>
            </Paper>
                    </Grid.Col>
                </Grid>
        </Container>
        </Box>
    );
}
