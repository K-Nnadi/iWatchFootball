import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { Button, Paper, Text, Title, useMantineTheme } from '@mantine/core';
import classes from './news.carousel.module.css';

interface CardProps {
	image: string;
	title: string;
	category: string;
}

function Card({ image, title, category }: CardProps) {
	return (
		<Paper
			shadow="md"
			p="xl"
			radius="md"
			style={{ backgroundImage: `url(${image})` }}
			className={classes.card}
		>
			<div>
				<Text className={classes.category} size="xs">
					{category}
				</Text>
				<Title order={3} className={classes.title}>
					{title}
				</Title>
			</div>
			<Button variant="white" color="dark">
				Read
			</Button>
		</Paper>
	);
}

// Example football-themed data
const data = [
	{
		image:
			'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=400&q=80',
		title: 'Title race heats up in the Premier League',
		category: 'EPL',
	},
	{
		image:
			'https://images.unsplash.com/photo-1592206112774-73d688f6e46e?auto=format&w=400&q=80',
		title: 'Champions League review: Surprises and upsets',
		category: 'UCL',
	},
	{
		image:
			'https://images.unsplash.com/photo-1594450890928-98d96ebf2ad0?auto=format&w=400&q=80',
		title: 'Real Madrid unstoppable under new coach',
		category: 'La Liga',
	},
	{
		image:
			'https://images.unsplash.com/photo-1599245895529-3c0992ab3c91?auto=format&w=400&q=80',
		title: 'Five-star performance: A new star is born',
		category: 'Serie A',
	},
	{
		image:
			'https://images.unsplash.com/photo-1605973174423-47046f81ec9b?auto=format&w=400&q=80',
		title: 'Paris Saint-Germain eyeing another big signing',
		category: 'PSG',
	},
	{
		image:
			'https://images.unsplash.com/photo-1616941360635-7d51b6607429?auto=format&w=400&q=80',
		title: 'Bundesliga latest: Top scorers and stats',
		category: 'Bundesliga',
	},
];

export function NewsCarousel() {
	const theme = useMantineTheme();
	const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
	const slides = data.map((item) => (
		<Carousel.Slide key={item.title}>
			<Card {...item} />
		</Carousel.Slide>
	));

	return (
		<Carousel
			slideSize={mobile ? '100%' : '25%'}
			slideGap="md"
			align="start"
			loop
			slidesToScroll={mobile ? 1 : 4}
		>
			{slides}
		</Carousel>
	);
}
