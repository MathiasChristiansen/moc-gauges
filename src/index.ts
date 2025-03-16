export const helloGauges: () => string = () => {
  console.log("Hello Gauges!");
  return "Hello Gauges!";
};

export { SpeedometerGauge } from "./Gauges/Speedometer";
export { WindGauge } from "./Gauges/Wind";
export { CompassGauge } from "./Gauges/Compass";