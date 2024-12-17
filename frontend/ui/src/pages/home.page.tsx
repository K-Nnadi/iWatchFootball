import {NewsCarousel} from "../components/carousel/news.carousel";
import { Grid, Skeleton, Container } from '@mantine/core';
const child = <Skeleton height={140} radius="md" animate={true} />;


export function HomePage() {
    return(
        <Container my="md" w="100%" size= "xl" >
            <h1>Home</h1>
            <p>Page with all the News</p>

            <Grid>
                <Grid.Col span={{base: 12, xs: 4}}>{child}</Grid.Col>
                <Grid.Col span={{base: 12, xs: 8}}>{child}</Grid.Col>
                <Grid.Col>{<NewsCarousel/>}</Grid.Col>
                <Grid.Col span={{base: 12, xs: 8}}>{child}</Grid.Col>
                <Grid.Col span={{base: 12, xs: 4}}>{child}</Grid.Col>
                <Grid.Col span={{base: 12, xs: 3}}>{child}</Grid.Col>
                <Grid.Col span={{base: 12, xs: 3}}>{child}</Grid.Col>
                <Grid.Col span={{base: 12, xs: 6}}>{child}</Grid.Col>
            </Grid>
        </Container>
    )
}