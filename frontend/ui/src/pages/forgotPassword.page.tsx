import { Box, Container, Group, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { usePageTransition } from '../hooks/usePageTransition';
import { UiButton } from '../components/ui';
import { notify } from '../shared/notify';
import { forgotPasswordChallenge, forgotPasswordReset } from '../shared/api/authRecovery.api';
import type { SecurityQuestion } from '../shared/securityQuestion';
import { passwordValidation } from './signUp.page';
import { useTranslation } from '../i18n';

type Step = 'identify' | 'reset';

export function ForgotPasswordPage() {
	const { t } = useTranslation();
	const { navigateWithTransition } = usePageTransition();
	const [step, setStep] = useState<Step>('identify');
	const [loading, setLoading] = useState(false);
	const [question, setQuestion] = useState<SecurityQuestion | null>(null);
	const [account, setAccount] = useState<{ email?: string; userName?: string }>({});

	const identifyForm = useForm({
		initialValues: { identifier: '' },
		validate: {
			identifier: (value: string) => (value.trim() ? null : t('auth.recoveryIdentifierRequired')),
		},
	});

	const resetForm = useForm({
		initialValues: { securityAnswer: '', newPassword: '', confirmPassword: '' },
		validate: {
			securityAnswer: (value: string) => (value.trim().length >= 2 ? null : t('auth.securityAnswerMinLength')),
			newPassword: (value: string) => (passwordValidation(value) ? null : t('auth.passwordRequirements')),
			confirmPassword: (value: string, values: { newPassword: string }) =>
				value === values.newPassword ? null : t('auth.passwordsDoNotMatch'),
		},
	});

	const parseIdentifier = (raw: string) => {
		const identifier = raw.trim();
		if (identifier.includes('@')) {
			return { email: identifier.toLowerCase() };
		}
		return { userName: identifier.replace(/^@/, '') };
	};

	const handleIdentify = async (values: typeof identifyForm.values) => {
		setLoading(true);
		try {
			const parsed = parseIdentifier(values.identifier);
			const res = await forgotPasswordChallenge(parsed);
			setAccount(parsed);
			setQuestion(res.question);
			setStep('reset');
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } }; message?: string };
			notify.error(
				t('auth.recoveryFailedTitle'),
				err?.response?.data?.message || err?.message || t('auth.recoveryFailedMessage'),
			);
		} finally {
			setLoading(false);
		}
	};

	const handleReset = async (values: typeof resetForm.values) => {
		setLoading(true);
		try {
			await forgotPasswordReset({
				...account,
				securityAnswer: values.securityAnswer.trim(),
				newPassword: values.newPassword,
			});
			notify.success(t('auth.recoverySuccessTitle'), t('auth.recoverySuccessMessage'));
			navigateWithTransition('/signIn');
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } }; message?: string };
			notify.error(
				t('auth.recoveryFailedTitle'),
				err?.response?.data?.message || err?.message || t('auth.recoveryFailedMessage'),
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container size={420} my={40}>
			<Paper p="xl" radius="md" shadow="lg" withBorder>
				<Box mb="xl">
					<Title order={2} ta="center" mt="md" mb="lg">
						{t('auth.forgotPasswordTitle')}
					</Title>
					<Text size="sm" c="dimmed" ta="center" mb="lg">
						{step === 'identify'
							? t('auth.forgotPasswordIdentifySubtitle')
							: t('auth.forgotPasswordResetSubtitle')}
					</Text>
				</Box>

				{step === 'identify' ? (
					<form onSubmit={identifyForm.onSubmit((values) => void handleIdentify(values))}>
						<Text size="sm" mb="xs">
							{t('auth.recoveryIdentifierLabel')}
						</Text>
						<TextInput
							size="md"
							placeholder={t('auth.recoveryIdentifierPlaceholder')}
							mb="md"
							{...identifyForm.getInputProps('identifier')}
						/>
						<UiButton fullWidth size="md" type="submit" loading={loading} disabled={loading}>
							{t('auth.continue')}
						</UiButton>
					</form>
				) : (
					<form onSubmit={resetForm.onSubmit((values) => void handleReset(values))}>
						{question && (
							<Box mb="md" p="sm" style={{ border: '1px solid var(--ui-border)', borderRadius: 8 }}>
								<Text size="xs" c="dimmed" mb={4}>
									{t('auth.securityQuestionLabel')}
								</Text>
								<Text size="sm" fw={600}>
									{t(`auth.securityQuestions.${question}`)}
								</Text>
							</Box>
						)}
						<Text size="sm" mb="xs">
							{t('auth.securityAnswerLabel')}
						</Text>
						<TextInput
							size="md"
							placeholder={t('auth.securityAnswerPlaceholder')}
							mb="md"
							autoComplete="off"
							{...resetForm.getInputProps('securityAnswer')}
						/>
						<Text size="sm" mb="xs">
							{t('auth.newPassword')}
						</Text>
						<PasswordInput size="md" mb="md" {...resetForm.getInputProps('newPassword')} />
						<Text size="sm" mb="xs">
							{t('auth.confirmPassword')}
						</Text>
						<PasswordInput size="md" mb="md" {...resetForm.getInputProps('confirmPassword')} />
						<Group grow>
							<UiButton
								variant="outline"
								size="md"
								type="button"
								onClick={() => {
									setStep('identify');
									setQuestion(null);
									resetForm.reset();
								}}
							>
								{t('onboarding.back')}
							</UiButton>
							<UiButton size="md" type="submit" loading={loading} disabled={loading}>
								{t('auth.resetPassword')}
							</UiButton>
						</Group>
					</form>
				)}

				<UiButton
					fullWidth
					variant="subtle"
					size="md"
					mt="md"
					onClick={() => navigateWithTransition('/signIn')}
				>
					{t('auth.backToSignIn')}
				</UiButton>
			</Paper>
		</Container>
	);
}
