import sampleChartJson from './sampleStadiumChart.json';

/**
 * Sample Seats.io chart JSON configuration for testing
 * This can be used to test the StadiumMap component with Seats.io integration
 * 
 * Usage:
 * ```tsx
 * import { sampleStadiumChart } from './components/stadium/sampleStadiumChart';
 * 
 * <StadiumMap
 *   useSeatsio={true}
 *   seatsioChartJson={sampleStadiumChart}
 *   onSeatsioObjectSelected={(object) => console.log('Selected:', object)}
 * />
 * ```
 */
export const sampleStadiumChart = sampleChartJson;

export default sampleStadiumChart;


