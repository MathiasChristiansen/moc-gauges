import { SpeedometerGauge } from "./Gauges/Speedometer";
import { WindGauge } from "./Gauges/Wind";
import { CompassGauge } from "./Gauges/Compass";
import { TrendGauge } from "./Gauges/trend";

export { SpeedometerGauge } from "./Gauges/Speedometer";
export { WindGauge } from "./Gauges/Wind";
export { CompassGauge } from "./Gauges/Compass";
export { TrendGauge } from "./Gauges/trend";
export { GaugeBase } from "./Gauges/base";

export const GAUGE_MAP = {
  speedometer: SpeedometerGauge,
  wind: WindGauge,
  compass: CompassGauge,
  trend: TrendGauge
};
