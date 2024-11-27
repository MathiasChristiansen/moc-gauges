export const helloGauges: () => string = () => {
  console.log("Hello Gauges!");
  return "Hello Gauges!";
};

export { SpeedometerGauge } from "./Speedometer";
export { CompassGauge } from "./Compass";
export * from "./BaseGauge";
