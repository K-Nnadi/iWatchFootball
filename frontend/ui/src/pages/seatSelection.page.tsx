import {
    Container,
    Title,
    Text,
    Paper,
    Group,
    Button,
    NumberInput,
    Card,
    Badge,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface SeatSection {
    id: string;
    name: string; // Location name (e.g., "Upper Tier")
    price: number; // Price per ticket
    remaining: number; // Remaining tickets available
}

export function SeatSelectionPage() {
    const navigate = useNavigate();
    const { matchId } = useParams<{ matchId: string }>();
    const location = useLocation();

    const matchDetails = location.state || {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        date: '2023-12-25T18:00:00',
        venue: 'Stadium X',
    };

    const [seatSections, setSeatSections] = useState<SeatSection[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<{ [key: string]: number }>({});
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        // Simulate fetching seat sections with inventory
        const mockSeatSections: SeatSection[] = [
            { id: 'upper-tier', name: 'Upper Tier', price: 40, remaining: 120 },
            { id: 'lower-tier', name: 'Lower Tier', price: 60, remaining: 80 },
            { id: 'vip-section', name: 'VIP Section', price: 150, remaining: 10 },
        ];
        setSeatSections(mockSeatSections);
        setSelectedSeats(mockSeatSections.reduce((acc, section) => ({ ...acc, [section.id]: 0 }), {}));
    }, []);

    useEffect(() => {
        // Calculate total price dynamically
        const total = seatSections.reduce(
            (sum, section) => sum + (selectedSeats[section.id] || 0) * section.price,
            0
        );
        setTotalPrice(total);
    }, [selectedSeats, seatSections]);

    const handleSeatChange = (sectionId: string, value: number) => {
        setSelectedSeats((prev) => ({
            ...prev,
            [sectionId]: Math.min(value, seatSections.find((section) => section.id === sectionId)?.remaining || 0),
        }));
    };

    const handleProceedToCheckout = () => {
        const selectedDetails = seatSections
            .filter((section) => selectedSeats[section.id] > 0)
            .map((section) => ({
                location: section.name,
                price: section.price,
                quantity: selectedSeats[section.id],
                subtotal: selectedSeats[section.id] * section.price,
            }));
        navigate('/checkout', {
            state: {
                matchId,
                homeTeam: matchDetails.homeTeam,
                awayTeam: matchDetails.awayTeam,
                date: matchDetails.date,
                venue: matchDetails.venue,
                selectedDetails,
                totalPrice,
            },
        });
    };

    const lowestPrice = Math.min(...seatSections.map((section) => section.price));
    const totalRemaining = seatSections.reduce((sum, section) => sum + section.remaining, 0);

    return (
        <Container size="sm" my="xl">
            <Title order={2} mb="lg">
                Select Your Seats
            </Title>

            <Paper shadow="xs" radius="md" p="md" withBorder mb="lg">
                <Text weight={500} size="sm">
                    <strong>{totalRemaining}</strong> tickets remaining, starting from <strong>${lowestPrice.toFixed(2)}</strong>.
                </Text>
            </Paper>

            <Paper shadow="xs" radius="md" p="md" withBorder>
                <Title order={3} size="h5">
                    Match Details
                </Title>
                <Text weight={500} size="sm">
                    {matchDetails.homeTeam} vs {matchDetails.awayTeam}
                </Text>
                <Text size="sm">{new Date(matchDetails.date).toLocaleString()}</Text>
                <Text size="sm">Venue: {matchDetails.venue}</Text>
            </Paper>

            <Title order={3} size="h5" mt="lg">
                Available Seat Sections
            </Title>
            <Group position="center" mt="md" spacing="lg">
                {seatSections.map((section) => (
                    <Card key={section.id} shadow="sm" padding="lg" radius="md" withBorder style={{ width: '100%' }}>
                        <Group position="apart" mb="sm">
                            <Text weight={500}>{section.name}</Text>
                            <Badge color="blue">${section.price.toFixed(2)}</Badge>
                        </Group>
                        <Text size="sm" color="dimmed">
                            Remaining Tickets: {section.remaining}
                        </Text>
                        <NumberInput
                            mt="md"
                            label="Select Quantity"
                            min={0}
                            max={section.remaining}
                            value={selectedSeats[section.id]}
                            onChange={(value) => handleSeatChange(section.id, value || 0)}
                        />
                    </Card>
                ))}
            </Group>

            <Paper shadow="xs" radius="md" p="md" mt="lg" withBorder>
                <Group position="apart" mt="lg">
                    <Text>Total Price:</Text>
                    <Text weight={700}>${totalPrice.toFixed(2)}</Text>
                </Group>
                <Button
                    fullWidth
                    mt="lg"
                    disabled={totalPrice === 0}
                    onClick={handleProceedToCheckout}
                >
                    Proceed to Checkout
                </Button>
            </Paper>
        </Container>
    );
}
