import { Container, Title, Text } from '@mantine/core';
import { useLocation } from 'react-router-dom';

export function ThankYouPage() {
    const location = useLocation();
    const ticketDetails = location.state || {};

    return (
        <Container size="sm" my="xl">
            <Title order={2} mb="lg">Thank You for Your Purchase!</Title>
            <Text>Enjoy the match!</Text>
            <Text fw={500}>{ticketDetails.homeTeam} vs {ticketDetails.awayTeam}</Text>
            <Text>{new Date(ticketDetails.date).toLocaleString()}</Text>
        </Container>
    );
}
