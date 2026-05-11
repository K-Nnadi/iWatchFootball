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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTransition } from '../hooks/usePageTransition';
import { useLogin, type LoginMutationResult } from '@iWatchFootball/clients/controllers/auth';
import type { LoginBody } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';
import { useAuthStore } from '../shared/stores/auth.store';
import { notify } from '../shared/notify';

const specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
const upperCase = /[A-Z]/;

export const passwordValidation = (value: string) => {
	return specialChar.test(value) && upperCase.test(value) && value.length >= 8;
};

export function LoginPage() {
	const location = useLocation();
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
						localStorage.setItem('rememberedLogin', form.values.identifier.trim());
						localStorage.removeItem('email');
					} else {
						localStorage.removeItem('rememberMe');
						localStorage.removeItem('rememberedLogin');
						localStorage.removeItem('email');
					}

					notify.success('Success', 'Logged in successfully!');

					const from =
						(location.state as { from?: { pathname: string } } | null)?.from?.pathname ??
						'/';
					navigateWithTransition(from);
				}
			},
			onError: (error: any) => {
				const raw = error?.response?.data?.message || error?.message;
				const errorMessage =
					raw === 'Invalid Login'
						? 'Login failed. Please check your credentials and try again.'
						: raw || 'Login failed. Please try again.';
				notify.error('Login Failed', errorMessage);
			},
		},
	});

	const form = useForm({
		initialValues: {
			identifier: '',
			password: ''
		},
		validate: {
			identifier: (value: string) => {
				const v = value.trim();
				if (!v) return 'Email or username is required';
				if (v.includes('@')) {
					return /^\S+@\S+$/.test(v) ? null : 'Invalid email';
				}
				if (v.length < 3) return 'Username must be at least 3 characters';
				if (!/^[a-zA-Z0-9_]+$/.test(v)) {
					return 'Username can only contain letters, numbers, and underscores';
				}
				return null;
			},
			password: (value: string) =>
				passwordValidation(value)
					? null
					: 'Password must contain at least 8 characters, one uppercase letter and one special character'
		}
	});

	useEffect(() => {
		if (rememberMeLocalStorage === 'true') {
			setRememberMe(true);
			const remembered =
				localStorage.getItem('rememberedLogin') || localStorage.getItem('email') || '';
			form.setFieldValue('identifier', remembered);
		}
	}, [rememberMeLocalStorage]);

	const formSubmit = (values: { identifier: string; password: string }) => {
		const raw = values.identifier.trim();
		const isEmail = raw.includes('@');
		// Backend checks email first; omit the other field so username login is not shadowed.
		// Avoid sending '' for email — class-validator may still run @IsEmail on empty strings.
		loginMutation.mutate({
			data: {
				password: values.password,
				...(isEmail ? { email: raw.toLowerCase() } : { userName: raw }),
			} as LoginBody,
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
						Email or username
					</Text>
					<TextInput
						size="md"
						placeholder="you@example.com or your_username"
						autoComplete="username"
						{...form.getInputProps('identifier')}
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
							href="/forgot-password"
							size="sm"
							onClick={(e) => {
								e.preventDefault();
								navigateWithTransition('/forgot-password');
							}}
						>
							Forgot password?
						</Anchor>
					</Flex>

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
