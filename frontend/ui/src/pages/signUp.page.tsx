import {
	Box,
	Button,
	Container,
	Paper,
	Text,
	TextInput,
	Title,
	useMantineTheme
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { usePageTransition } from "../hooks/usePageTransition";

export function SignUpPage() {
	const theme = useMantineTheme();
	const { navigateWithTransition } = usePageTransition();

	const form = useForm({
		initialValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: ''
		},
		validate: {
			firstName: (value) => (value ? null : 'First name is required'),
			lastName: (value) => (value ? null : 'Last name is required'),
			email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
			password: (value) => {
				// Add your password validation logic here. For example:
				const specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
				const upperCase = /[A-Z]/;
				return (specialChar.test(value) && upperCase.test(value) && value.length >= 8)
					? null
					: 'Password must contain at least 8 characters, one uppercase letter and one special character';
			}
		}
	});

	const formSubmit = (values: any) => {
		// Submit form logic here, e.g. register({ data: { ...values, type: UserEntityType.CUSTOMER } })
	};

	return (
		<Container size={420} my={40}>
			<Paper p="xl" radius="md" shadow="lg" withBorder>
				<form onSubmit={form.onSubmit((values) => formSubmit(values))}>
					<Box mb="xl">
						<Title order={2} align="center" mt="md" mb="lg">
							Sign Up
						</Title>
						<Text size="sm" color="dimmed" align="center" mb="lg">
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

					<Text size="sm" mb="xs">Password</Text>
					<TextInput
						type="password"
						size="md"
						placeholder="Your secure password"
						mb="md"
						{...form.getInputProps('password')}
					/>

					<Button my="xl" variant="filled" size="md" fullWidth type="submit">
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
