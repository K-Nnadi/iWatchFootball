import { Paper, Title, Text, Stack, Divider } from '@mantine/core';
import { IconUser, IconUserPlus } from '@tabler/icons-react';
import { ModernButton } from '../../components/modern';
import { usePageTransition } from '../../hooks/usePageTransition';

interface AuthenticationStepProps {
    onContinueAsGuest: () => void;
}

export function AuthenticationStep({ onContinueAsGuest }: AuthenticationStepProps) {
    const { navigateWithTransition } = usePageTransition();

    return (
        <Paper shadow="xs" radius="md" p="md" withBorder>
            <Title order={3} size="h5" mb="md">
                Sign In or Continue as Guest
            </Title>
            <Text size="sm" color="dimmed" mb="xl">
                Create an account to track your logged games and access exclusive features. 
                You can also continue as a guest, but your games won't be saved.
            </Text>

            <Stack gap="md">
                <ModernButton
                    variant="primary"
                    fullWidth
                    size="md"
                    leftSection={<IconUserPlus size={18} />}
                    onClick={() => navigateWithTransition('/auth/sign-up')}
                >
                    Create Account / Sign Up
                </ModernButton>

                <ModernButton
                    variant="outline"
                    fullWidth
                    size="md"
                    leftSection={<IconUser size={18} />}
                    onClick={() => navigateWithTransition('/signIn')}
                >
                    Sign In
                </ModernButton>

                <Divider label="OR" labelPosition="center" my="md" />

                <ModernButton
                    variant="outline"
                    fullWidth
                    size="md"
                    onClick={onContinueAsGuest}
                >
                    Continue as Guest
                </ModernButton>
            </Stack>
        </Paper>
    );
}

