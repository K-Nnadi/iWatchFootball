import { Container, Title, Text, Stack } from '@mantine/core';
import { useLocation } from 'react-router-dom';
import type { ThankYouPageState } from './checkout/types';

export function ThankYouPage() {
    const location = useLocation();
    const s = location.state as ThankYouPageState | undefined;

    const headline = s?.headline ?? 'Your tickets are confirmed.';
    const dateLine = s?.dateLine;

    return (
        <Container size="sm" my="xl">
            <Title order={2} mb="lg">Thank You for Your Purchase!</Title>
            <Stack gap="xs">
                <Text>Enjoy the match!</Text>
                <Text fw={500}>{headline}</Text>
                {dateLine ? <Text c="dimmed">{dateLine}</Text> : null}
                {s?.stadium ? (
                    <Text size="sm" c="dimmed">
                        {s.stadium}
                    </Text>
                ) : null}
            </Stack>
        </Container>
    );
}
