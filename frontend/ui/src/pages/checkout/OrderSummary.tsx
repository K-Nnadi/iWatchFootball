import {
    Paper,
    Title,
    Text,
    Group,
    Divider,
    Notification,
    Stack,
    Badge,
    Image,
    NumberInput,
    Anchor,
    Box,
    ActionIcon,
    Tooltip,
} from '@mantine/core';
import {
    IconAlertCircle,
    IconCalendar,
    IconMapPin,
    IconCheck,
    IconTicket,
    IconFlag,
    IconUsers,
    IconInfoCircle,
} from '@tabler/icons-react';
import { useState } from 'react';
import { CheckoutTicketDetails } from './types';

interface OrderSummaryProps {
    ticketDetails: CheckoutTicketDetails;
    isGuestCheckout: boolean;
}

export function OrderSummary({ ticketDetails, isGuestCheckout }: OrderSummaryProps) {
    const [quantity, setQuantity] = useState(ticketDetails.quantity || 1);
    const isMarketplace = ticketDetails.listingId != null;
    /** Primary checkout still uses this placeholder fee model in the UI until checkout is wired to backend fees. */
    const primaryServiceFeeRatio = 0.3;

    let pricePerTicket: number;
    let serviceFeePerTicket: number;
    let totalPerTicket: number;
    let feeLineLabel = 'Service Fee + Tax';

    if (
        isMarketplace &&
        typeof ticketDetails.marketplaceSellerAskPrice === 'number' &&
        typeof ticketDetails.marketplacePlatformFee === 'number'
    ) {
        pricePerTicket = ticketDetails.marketplaceSellerAskPrice;
        serviceFeePerTicket = ticketDetails.marketplacePlatformFee;
        totalPerTicket = ticketDetails.price ?? pricePerTicket + serviceFeePerTicket;
        feeLineLabel = 'Platform service fee';
    } else if (isMarketplace) {
        // Older cart payloads: total is stored on price — do not invent a fake 30% on top.
        totalPerTicket = ticketDetails.price || 0;
        pricePerTicket = totalPerTicket;
        serviceFeePerTicket = 0;
        feeLineLabel = 'Included';
    } else {
        pricePerTicket = ticketDetails.price || 0;
        serviceFeePerTicket = pricePerTicket * primaryServiceFeeRatio;
        totalPerTicket = pricePerTicket + serviceFeePerTicket;
    }

    const total = totalPerTicket * quantity;
    const priceSubtext =
        isMarketplace &&
        typeof ticketDetails.marketplaceSellerAskPrice === 'number' &&
        typeof ticketDetails.marketplacePlatformFee === 'number' &&
        ticketDetails.marketplacePlatformFee > 0
            ? 'Seller asking price'
            : isMarketplace
              ? 'Total to pay'
              : 'Per ticket';

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        const day = days[date.getDay()];
        const dayNum = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}, ${dayNum}${getOrdinal(dayNum)} ${month} ${year} ${hours}:${minutes}`;
    };

    const getOrdinal = (n: number) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    return (
        <Paper shadow="xs" radius="md" p={0} withBorder style={{ position: 'sticky', top: '20px' }}>
            {isGuestCheckout && (
                <Box p="md" pb={0}>
                    <Notification
                        icon={<IconAlertCircle />}
                        color="yellow"
                        title="Guest Checkout"
                        mb="md"
                        onClose={() => {}}
                        withCloseButton={false}
                    >
                        Your games will not be logged or saved.
                    </Notification>
                </Box>
            )}

            {ticketDetails.imageUrl && (
                <Image
                    src={ticketDetails.imageUrl}
                    alt={
                        ticketDetails.fixtureLabel ??
                        `${ticketDetails.homeTeam} vs ${ticketDetails.awayTeam}`
                    }
                    height={200}
                    fit="cover"
                    radius="md"
                    style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                />
            )}

            <Stack gap="md" p="md">
                {ticketDetails.competition && (
                    <Text size="xs" color="dimmed" fw={500}>
                        {ticketDetails.competition.toUpperCase()}
                    </Text>
                )}

                <Title order={3} size="h4" fw={700}>
                    {ticketDetails.fixtureLabel ?? `${ticketDetails.homeTeam} vs ${ticketDetails.awayTeam}`}
                </Title>

                <Group gap="xs">
                    <IconCalendar size={16} />
                    <Text size="sm">{formatDate(ticketDetails.date)}</Text>
                </Group>

                <Group gap="xs">
                    <IconMapPin size={16} />
                    <Text size="sm">{ticketDetails.venue.trim() !== '' ? ticketDetails.venue : '—'}</Text>
                </Group>

                <Divider variant="dashed" />

                <Stack gap="xs">
                    <Group gap="xs">
                        <IconCheck size={16} color="green" />
                        <Text size="sm">Excellent 4.7 out of 5</Text>
                        <Badge size="xs" color="green" variant="light">
                            Trustpilot
                        </Badge>
                    </Group>
                    <Group gap="xs">
                        <IconCheck size={16} color="green" />
                        <Text size="sm">150% Money Back Guarantee</Text>
                        <Tooltip label="Full refund guarantee if tickets are not delivered">
                            <ActionIcon size="xs" variant="subtle" color="gray">
                                <IconInfoCircle size={12} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                    <Group gap="xs">
                        <IconCheck size={16} color="green" />
                        <Text size="sm">Easy and secure payments</Text>
                    </Group>
                </Stack>

                <Group gap="xs" mt="xs">
                    <Text size="xs" color="dimmed">
                        PayPal • VISA • Mastercard • AMEX • Klarna • Apple Pay • Google Pay
                    </Text>
                </Group>

                <Divider variant="dashed" />

                <Stack gap="xs">
                    <Group gap="xs">
                        <IconTicket size={16} />
                        <Box>
                            <Text size="sm" fw={500}>
                                E-ticket(s)
                            </Text>
                            <Text size="xs" color="dimmed">
                                Digital tickets (usually PDF) will be sent to you digitally, always in time for the
                                event.
                            </Text>
                        </Box>
                    </Group>

                    {ticketDetails.section && (
                        <Group gap="xs" justify="space-between">
                            <Group gap="xs">
                                <IconFlag size={16} />
                                <Box>
                                    <Text size="sm">
                                        Section: {ticketDetails.section}
                                        {ticketDetails.row && ` - ROW ${ticketDetails.row}`}
                                    </Text>
                                    {ticketDetails.fanSide && (
                                        <Text size="xs" color="dimmed">
                                            {ticketDetails.fanSide} fans
                                        </Text>
                                    )}
                                </Box>
                            </Group>
                            <Box
                                style={{
                                    width: '40px',
                                    height: '60px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '4px',
                                    background: 'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)',
                                }}
                            />
                        </Group>
                    )}

                    {ticketDetails.seatsTogether && (
                        <Group gap="xs">
                            <IconUsers size={16} />
                            <Box>
                                <Text size="sm">
                                    Seats: {ticketDetails.seatsTogether === 1 ? 'Single Seat' : `Up To ${ticketDetails.seatsTogether} Together`}
                                </Text>
                                <Text size="xs" color="dimmed">
                                    {ticketDetails.seatsTogether === 1
                                        ? 'Single seat selection'
                                        : `Max ${ticketDetails.seatsTogether} seats will be next to each other.`}
                                </Text>
                            </Box>
                        </Group>
                    )}

                    {ticketDetails.unrestrictedView !== false && (
                        <Group gap="xs">
                            <IconCheck size={16} color="green" />
                            <Text size="sm">Unrestricted view</Text>
                            <Tooltip label="Clear view of the pitch">
                                <ActionIcon size="xs" variant="subtle" color="gray">
                                    <IconInfoCircle size={12} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    )}
                </Stack>

                <Divider variant="dashed" />

                <Group justify="space-between" align="flex-start">
                    <NumberInput
                        value={quantity}
                        onChange={(val) => setQuantity(typeof val === 'number' ? val : 1)}
                        min={1}
                        max={10}
                        size="sm"
                        style={{ width: '80px' }}
                    />
                    <Box style={{ flex: 1, textAlign: 'right' }}>
                        <Text size="sm" fw={500}>
                            £{pricePerTicket.toFixed(2)}
                        </Text>
                        <Text size="xs" color="dimmed">
                            {priceSubtext}
                        </Text>
                    </Box>
                </Group>

                {!(isMarketplace && serviceFeePerTicket === 0) && (
                    <Group justify="space-between">
                        <Text size="sm" color="dimmed">
                            {feeLineLabel}
                        </Text>
                        <Box style={{ textAlign: 'right' }}>
                            <Text size="sm" color="dimmed">
                                £{serviceFeePerTicket.toFixed(2)}
                            </Text>
                            <Text size="xs" color="dimmed">
                                Per ticket
                            </Text>
                        </Box>
                    </Group>
                )}

                <Divider variant="dashed" />

                <Group justify="space-between">
                    <Box>
                        <Text size="lg" fw={700}>
                            Total
                        </Text>
                        <Anchor size="xs" color="blue" component="button">
                            Voucher code?
                        </Anchor>
                    </Box>
                    <Text size="xl" fw={700}>
                        £{total.toFixed(2)}
                    </Text>
                </Group>
            </Stack>
        </Paper>
    );
}

