import { Box, Container, Group, Paper, Text, Title } from '@mantine/core';
import { usePageTransition } from '../hooks/usePageTransition';
import { UiButton } from '../components/ui';
import { notify } from '../shared/notify';

const SUPPORT_EMAIL = 'iwatchfootball@gmail.com';

function openPasswordResetMailto() {
	const subject = encodeURIComponent('Password reset request');
	const body = encodeURIComponent(
		'Please include the email or username tied to your account.\n'
	);
	const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
	window.location.href = mailtoLink;
	notify.success(
		'Email client opening',
		`If nothing opens, email ${SUPPORT_EMAIL} directly.`
	);
}

export function ForgotPasswordPage() {
	const { navigateWithTransition } = usePageTransition();

	return (
		<Container size={420} my={40}>
			<Paper p="xl" radius="md" shadow="lg" withBorder>
				<Box mb="xl">
					<Title order={2} ta="center" mt="md" mb="lg">
						Forgot password
					</Title>
					<Text size="sm" color="dimmed" ta="center" mb="lg">
						Self-service reset is not available yet. Email us and we will help you get back
						into your account.
					</Text>
				</Box>
				<Group justify="center" mt="xl" gap="md">
					<UiButton fullWidth size="md" onClick={openPasswordResetMailto}>
						Email support
					</UiButton>
					<UiButton
						fullWidth
						variant="outline"
						size="md"
						onClick={() => navigateWithTransition('/signIn')}
					>
						Back to sign in
					</UiButton>
				</Group>
			</Paper>
		</Container>
	);
}
