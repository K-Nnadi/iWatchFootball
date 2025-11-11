import {
	Anchor,
	Box,
	Button,
	Card,
	Checkbox,
	Container,
	Flex,
	Group,
	Paper,
	PasswordInput,
	Text,
	TextInput,
	Title,
	useMantineTheme
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { usePageTransition } from '../hooks/usePageTransition';

const specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
const upperCase = /[A-Z]/;

export const passwordValidation = (value: string) => {
	return specialChar.test(value) && upperCase.test(value) && value.length >= 8;
};

export function LoginPage() {
	const { navigateWithTransition } = usePageTransition();
	const theme = useMantineTheme();
	const [rememberMe, setRememberMe] = useState(false);
	const rememberMeLocalStorage = localStorage.getItem('rememberMe');

	const form = useForm({
		initialValues: {
			email: '',
			password: ''
		},
		validate: {
			email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
			password: (value) =>
				passwordValidation(value)
					? null
					: 'Password must contain at least 8 characters, one uppercase letter and one special character'
		}
	});

	useEffect(() => {
		if (rememberMeLocalStorage === 'true') {
			setRememberMe(true);
			form.setFieldValue('email', localStorage.getItem('email') || '');
			form.setFieldValue('password', localStorage.getItem('password') || '');
		}
	}, [rememberMeLocalStorage]);

	const formSubmit = (values: any) => {
		// Handle form submit logic here
		// e.g. login(values)
	};

	return (
		<Container size={420} my={40}>
			<Paper p="xl" radius="md" shadow="lg" withBorder>
				<form onSubmit={form.onSubmit((values) => formSubmit(values))}>
					<Box mb="xl">
						<Title order={2} align="center" mt="md" mb="lg">
							Login
						</Title>
						<Text size="sm" color="dimmed" align="center" mb="lg">
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

					<Group position="center" mt="xl" spacing="md">
						<Button type="submit" fullWidth variant="filled" size="md">
							Login
						</Button>
						<Button
							fullWidth
							variant="outline"
							size="md"
							onClick={() => navigateWithTransition('/auth/sign-up')}
						>
							Sign up
						</Button>
					</Group>
				</form>
			</Paper>
		</Container>
	);
}
