import {
	Anchor,
	Box,
	Button,
	Checkbox,
	Container,
	Flex,
	Group,
	Paper,
	PasswordInput,
	Text,
	TextInput,
	Title,
	Alert
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { usePageTransition } from '../hooks/usePageTransition';
import { useLogin, type LoginMutationResult } from '@iWatchFootball/clients/controllers/auth';
import { useAuthStore } from '../shared/stores/auth.store';
import { notifications } from '@mantine/notifications';

const specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
const upperCase = /[A-Z]/;

export const passwordValidation = (value: string) => {
	return specialChar.test(value) && upperCase.test(value) && value.length >= 8;
};

export function LoginPage() {
	const { navigateWithTransition } = usePageTransition();
	const { login: setAuthState } = useAuthStore();
	const [rememberMe, setRememberMe] = useState(false);
	const rememberMeLocalStorage = localStorage.getItem('rememberMe');

	const loginMutation = useLogin({
		mutation: {
			onSuccess: (data: LoginMutationResult) => {
				if (data.access_token && data.user) {
					setAuthState(data.access_token, data.user);
					
					if (rememberMe) {
						localStorage.setItem('rememberMe', 'true');
						localStorage.setItem('email', form.values.email.toLowerCase());
					} else {
						localStorage.removeItem('rememberMe');
						localStorage.removeItem('email');
					}

					notifications.show({
						title: 'Success',
						message: 'Logged in successfully!',
						color: 'green',
					});

					navigateWithTransition('/');
				}
			},
			onError: (error: any) => {
				const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
				notifications.show({
					title: 'Login Failed',
					message: errorMessage,
					color: 'red',
				});
			},
		},
	});

	const form = useForm({
		initialValues: {
			email: '',
			password: ''
		},
		validate: {
			email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
			password: (value: string) =>
				passwordValidation(value)
					? null
					: 'Password must contain at least 8 characters, one uppercase letter and one special character'
		}
	});

	useEffect(() => {
		if (rememberMeLocalStorage === 'true') {
			setRememberMe(true);
			form.setFieldValue('email', localStorage.getItem('email') || '');
		}
	}, [rememberMeLocalStorage]);

	const formSubmit = (values: { email: string; password: string }) => {
		const emailLowercase = values.email.toLowerCase();
		loginMutation.mutate({
			data: {
				email: emailLowercase,
				password: values.password,
				userName: emailLowercase // Using email as userName for login
			}
		});
	};

	return (
		<Container size={420} my={40}>
			<Paper p="xl" radius="md" shadow="lg" withBorder>
				<form onSubmit={form.onSubmit((values) => formSubmit(values))}>
					<Box mb="xl">
						<Title order={2} ta="center" mt="md" mb="lg">
							Login
						</Title>
						<Text size="sm" color="dimmed" ta="center" mb="lg">
							Welcome back! Please enter your credentials to sign in.
						</Text>
					</Box>

					<Text size="sm" mb="xs">
						Email
					</Text>
					<TextInput
						size="md"
						placeholder="you@example.com"
						{...form.getInputProps('email')}
						mb="md"
					/>

					<Text size="sm" mb="xs">
						Password
					</Text>
					<PasswordInput
						size="md"
						placeholder="Your secure password"
						{...form.getInputProps('password')}
					/>

					<Flex justify="space-between" align="center" mt="md">
						<Checkbox
							label="Remember me"
							checked={rememberMe}
							onChange={(e) => setRememberMe(e.currentTarget.checked)}
						/>
						<Anchor
							href="#"
							size="sm"
							onClick={(e) => {
								e.preventDefault();
								// Handle forgot password logic
							}}
						>
							Forgot password?
						</Anchor>
					</Flex>

					{loginMutation.isError && (
						<Alert color="red" mb="md">
							Login failed. Please check your credentials and try again.
						</Alert>
					)}

					<Group justify="center" mt="xl" gap="md">
						<Button 
							type="submit" 
							fullWidth 
							variant="filled" 
							size="md"
							loading={loginMutation.isPending}
							disabled={loginMutation.isPending}
						>
							Login
						</Button>
						<Button
							fullWidth
							variant="outline"
							size="md"
							onClick={() => navigateWithTransition('/join')}
						>
							Sign up
						</Button>
					</Group>
				</form>
			</Paper>
		</Container>
	);
}
