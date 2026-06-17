import {
	Box,
	Container,
	Paper,
	Text,
	TextInput,
	Title,
	PasswordInput,
	Alert,
	Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useMemo, useState } from "react";
import { usePageTransition } from "../hooks/usePageTransition";
import { UiButton } from "../components/ui";
import { useRegister, type RegisterMutationResult } from "@iWatchFootball/clients/controllers/auth";
import { useAuthStore } from "../shared/stores/auth.store";
import { notify } from "../shared/notify";
import { getSecurityQuestions } from "../shared/api/authRecovery.api";
import { SECURITY_QUESTION_VALUES, type SecurityQuestion } from "../shared/securityQuestion";
import { useTranslation } from "../i18n";

const specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
const upperCase = /[A-Z]/;

export const passwordValidation = (value: string) => {
	return specialChar.test(value) && upperCase.test(value) && value.length >= 8;
};

export function SignUpPage() {
	const { t } = useTranslation();
	const { navigateWithTransition } = usePageTransition();
	const { login: setAuthState } = useAuthStore();
	const [questions, setQuestions] = useState<SecurityQuestion[]>([...SECURITY_QUESTION_VALUES]);

	useEffect(() => {
		void getSecurityQuestions()
			.then((res) => {
				if (res.questions?.length) setQuestions(res.questions as SecurityQuestion[]);
			})
			.catch(() => {
				/* use local fallback list */
			});
	}, []);

	const questionOptions = useMemo(
		() =>
			questions.map((q) => ({
				value: q,
				label: t(`auth.securityQuestions.${q}`),
			})),
		[questions, t],
	);

	const registerMutation = useRegister({
		mutation: {
			onSuccess: (data: RegisterMutationResult) => {
				if (data.access_token && data.user) {
					setAuthState(data.access_token, data.user);
					notify.success(t('auth.signUpSuccessTitle'), t('auth.signUpSuccessMessage'));
					navigateWithTransition('/onboarding');
				}
			},
			onError: (error: unknown) => {
				const err = error as { response?: { data?: { message?: string } }; message?: string };
				const errorMessage =
					err?.response?.data?.message || err?.message || t('auth.signUpFailedMessage');
				notify.error(t('auth.signUpFailedTitle'), errorMessage);
			},
		},
	});

	const form = useForm({
		initialValues: {
			firstName: '',
			lastName: '',
			email: '',
			userName: '',
			password: '',
			securityQuestion: '' as SecurityQuestion | '',
			securityAnswer: '',
		},
		validate: {
			firstName: (value: string) => (value.trim() ? null : t('auth.firstNameRequired')),
			lastName: (value: string) => (value.trim() ? null : t('auth.lastNameRequired')),
			email: (value: string) => (/^\S+@\S+$/.test(value) ? null : t('auth.emailInvalid')),
			userName: (value: string) => {
				if (!value.trim()) return t('auth.usernameRequired');
				if (value.length < 3) return t('auth.usernameMinLength');
				if (!/^[a-zA-Z0-9_]+$/.test(value)) return t('auth.usernameFormat');
				return null;
			},
			password: (value: string) =>
				passwordValidation(value) ? null : t('auth.passwordRequirements'),
			securityQuestion: (value: string) => (value ? null : t('auth.securityQuestionRequired')),
			securityAnswer: (value: string) => {
				const trimmed = value.trim();
				if (trimmed.length < 2) return t('auth.securityAnswerMinLength');
				if (trimmed.length > 128) return t('auth.securityAnswerMaxLength');
				return null;
			},
		},
	});

	const formSubmit = (values: typeof form.values) => {
		registerMutation.mutate({
			data: {
				email: values.email.toLowerCase(),
				firstName: values.firstName,
				lastName: values.lastName,
				userName: values.userName,
				password: values.password,
				securityQuestion: values.securityQuestion,
				securityAnswer: values.securityAnswer.trim(),
			},
		});
	};

	return (
		<Container size={420} my={40}>
			<Paper p="xl" radius="md" shadow="lg" withBorder>
				<form onSubmit={form.onSubmit((values) => formSubmit(values))}>
					<Box mb="xl">
						<Title order={2} ta="center" mt="md" mb="lg">
							{t('auth.signUpTitle')}
						</Title>
						<Text size="sm" c="dimmed" ta="center" mb="lg">
							{t('auth.signUpSubtitle')}
						</Text>
					</Box>

					<Text size="sm" mb="xs">{t('auth.firstName')}</Text>
					<TextInput size="md" placeholder={t('auth.firstNamePlaceholder')} mb="md" {...form.getInputProps('firstName')} />

					<Text size="sm" mb="xs">{t('auth.lastName')}</Text>
					<TextInput size="md" placeholder={t('auth.lastNamePlaceholder')} mb="md" {...form.getInputProps('lastName')} />

					<Text size="sm" mb="xs">{t('auth.email')}</Text>
					<TextInput size="md" placeholder={t('auth.emailPlaceholder')} mb="md" {...form.getInputProps('email')} />

					<Text size="sm" mb="xs">{t('auth.username')}</Text>
					<TextInput size="md" placeholder={t('auth.usernamePlaceholder')} mb="md" {...form.getInputProps('userName')} />

					<Text size="sm" mb="xs">{t('auth.password')}</Text>
					<PasswordInput size="md" placeholder={t('auth.passwordPlaceholder')} mb="md" {...form.getInputProps('password')} />

					<Text size="sm" mb="xs">{t('auth.securityQuestionLabel')}</Text>
					<Select
						size="md"
						placeholder={t('auth.securityQuestionPlaceholder')}
						data={questionOptions}
						mb="xs"
						{...form.getInputProps('securityQuestion')}
					/>
					<Text size="xs" c="dimmed" mb="md">
						{t('auth.securityQuestionHint')}
					</Text>

					<Text size="sm" mb="xs">{t('auth.securityAnswerLabel')}</Text>
					<TextInput
						size="md"
						placeholder={t('auth.securityAnswerPlaceholder')}
						mb="md"
						autoComplete="off"
						{...form.getInputProps('securityAnswer')}
					/>

					{registerMutation.isError && (
						<Alert color="red" mb="md">
							{t('auth.signUpFailedMessage')}
						</Alert>
					)}

					<UiButton
						my="xl"
						size="md"
						fullWidth
						type="submit"
						loading={registerMutation.isPending}
						disabled={registerMutation.isPending}
					>
						{t('auth.signUpButton')}
					</UiButton>
				</form>
			</Paper>
		</Container>
	);
}
