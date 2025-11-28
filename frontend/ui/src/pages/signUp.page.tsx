import {
	Box,
	Button,
	Container,
	Paper,
	Text,
	TextInput,
	Title,
	PasswordInput,
	Alert
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { usePageTransition } from "../hooks/usePageTransition";
import { useRegister } from "@iWatchFootball/clients/controllers/auth";
import { useAuthStore } from "../shared/stores/auth.store";
import { notifications } from "@mantine/notifications";

const specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
const upperCase = /[A-Z]/;

export const passwordValidation = (value: string) => {
	return specialChar.test(value) && upperCase.test(value) && value.length >= 8;
};

export function SignUpPage() {
	const { navigateWithTransition } = usePageTransition();
	const { login: setAuthState } = useAuthStore();

	const registerMutation = useRegister({
		mutation: {
			onSuccess: (data) => {
				if (data.access_token && data.user) {
					setAuthState(data.access_token, data.user);
					
					notifications.show({
						title: 'Success',
						message: 'Account created successfully!',
						color: 'green',
					});

					navigateWithTransition('/');
				}
			},
			onError: (error: any) => {
				const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed. Please try again.';
				notifications.show({
					title: 'Registration Failed',
					message: errorMessage,
					color: 'red',
				});
			},
		},
	});

	const form = useForm({
		initialValues: {
			firstName: '',
			lastName: '',
			email: '',
			userName: '',
			password: ''
		},
		validate: {
			firstName: (value: string) => (value.trim() ? null : 'First name is required'),
			lastName: (value: string) => (value.trim() ? null : 'Last name is required'),
			email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
			userName: (value: string) => {
				if (!value.trim()) return 'Username is required';
				if (value.length < 3) return 'Username must be at least 3 characters';
				if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
				return null;
			},
			password: (value: string) => {
				return passwordValidation(value)
					? null
					: 'Password must contain at least 8 characters, one uppercase letter and one special character';
			}
		}
	});

	const formSubmit = (values: typeof form.values) => {
		registerMutation.mutate({
			data: {
				email: values.email,
				firstName: values.firstName,
				lastName: values.lastName,
				userName: values.userName,
				password: values.password
			}
		});
	};

	return (
		<Container size={420} my={40}>
			<Paper p="xl" radius="md" shadow="lg" withBorder>
				<form onSubmit={form.onSubmit((values) => formSubmit(values))}>
					<Box mb="xl">
						<Title order={2} ta="center" mt="md" mb="lg">
							Sign Up
						</Title>
						<Text size="sm" color="dimmed" ta="center" mb="lg">
							Create an account to start tracking your games!
						</Text>
					</Box>

					<Text size="sm" mb="xs">First Name</Text>
					<TextInput
						size="md"
						placeholder="John"
						mb="md"
						{...form.getInputProps('firstName')}
					/>

					<Text size="sm" mb="xs">Last Name</Text>
					<TextInput
						size="md"
						placeholder="Doe"
						mb="md"
						{...form.getInputProps('lastName')}
					/>

					<Text size="sm" mb="xs">Email</Text>
					<TextInput
						size="md"
						placeholder="you@example.com"
						mb="md"
						{...form.getInputProps('email')}
					/>

					<Text size="sm" mb="xs">Username</Text>
					<TextInput
						size="md"
						placeholder="johndoe"
						mb="md"
						{...form.getInputProps('userName')}
					/>

					<Text size="sm" mb="xs">Password</Text>
					<PasswordInput
						size="md"
						placeholder="Your secure password"
						mb="md"
						{...form.getInputProps('password')}
					/>

					{registerMutation.isError && (
						<Alert color="red" mb="md">
							Registration failed. Please check your information and try again.
						</Alert>
					)}

					<Button 
						my="xl" 
						variant="filled" 
						size="md" 
						fullWidth 
						type="submit"
						loading={registerMutation.isPending}
						disabled={registerMutation.isPending}
					>
						Sign up
					</Button>
					<Button
						my="xl"
						variant="outline"
						size="md"
						fullWidth
						onClick={() => navigateWithTransition('/signIn')}
					>
						Login
					</Button>
				</form>
			</Paper>
		</Container>
	);
}
