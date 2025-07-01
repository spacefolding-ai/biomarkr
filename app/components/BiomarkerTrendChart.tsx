import { format } from "date-fns";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Circle, G, Path, Rect } from "react-native-svg";
import { Grid, LineChart } from "react-native-svg-charts";

interface DataPoint {
  date: string;
  value: number;
  abnormal_flag?: string;
}

interface BiomarkerTrendChartProps {
  data: DataPoint[];
  unit: string;
  markerName: string;
  referenceRange?: [number, number]; // [min, max]
  optimalRange?: [number, number]; // [min, max]
}

// Helper function to get color for a value based on ranges
const getLineColorForValue = (
  value: number,
  referenceRange?: [number, number],
  optimalRange?: [number, number]
) => {
  if (optimalRange && value >= optimalRange[0] && value <= optimalRange[1]) {
    return "#007AFF"; // Blue for optimal
  } else if (
    referenceRange &&
    value >= referenceRange[0] &&
    value <= referenceRange[1]
  ) {
    return "#34C759"; // Green for normal
  } else {
    return "#FF9500"; // Orange for abnormal
  }
};

export const BiomarkerTrendChart: React.FC<BiomarkerTrendChartProps> = ({
  data,
  unit,
  markerName,
  referenceRange,
  optimalRange,
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    null
  );

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dynamics</Text>
          <Text style={styles.timeRange}>all time</Text>
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No historical data available</Text>
        </View>
      </View>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const values = sortedData.map((item) => item.value);
  const dates = sortedData.map((item) => item.date);

  // Handle single data point case
  if (data.length === 1) {
    const singlePoint = sortedData[0];
    const color = getLineColorForValue(
      singlePoint.value,
      referenceRange,
      optimalRange
    );

    // Calculate Y-axis range
    const ranges = [referenceRange, optimalRange].filter(Boolean) as [
      number,
      number
    ][];
    const allValues = [singlePoint.value, ...ranges.flat()];
    const maxValue = Math.max(...allValues);
    const padding = maxValue * 0.2;
    const yMin = 0;
    const yMax = maxValue + padding;

    // Create fallback range if no reference range provided
    const fallbackRange = !referenceRange
      ? [Math.max(0, singlePoint.value * 0.8), singlePoint.value * 1.2]
      : null;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dynamics</Text>
          <Text style={styles.timeRange}>all time</Text>
        </View>

        <View style={styles.singlePointContainer}>
          <View style={styles.singlePointChart}>
            {/* Background zones */}
            <View style={styles.singlePointBackground}>
              {/* Gray abnormal zones */}
              {referenceRange && (
                <>
                  {/* Abnormal HIGH zone (above reference range) */}
                  <View
                    style={[
                      styles.singlePointZone,
                      {
                        height: `${
                          ((yMax - referenceRange[1]) / (yMax - yMin)) * 100
                        }%`,
                        backgroundColor: "#8E8E93",
                        opacity: 0.2,
                        top: 0,
                      },
                    ]}
                  />
                  {/* Abnormal LOW zone (below reference range) */}
                  <View
                    style={[
                      styles.singlePointZone,
                      {
                        height: `${(referenceRange[0] / (yMax - yMin)) * 100}%`,
                        backgroundColor: "#8E8E93",
                        opacity: 0.2,
                        bottom: 0,
                      },
                    ]}
                  />
                </>
              )}

              {/* Green normal zone */}
              {referenceRange && (
                <View
                  style={[
                    styles.singlePointZone,
                    {
                      height: `${
                        ((referenceRange[1] - referenceRange[0]) /
                          (yMax - yMin)) *
                        100
                      }%`,
                      backgroundColor: "#34C759",
                      opacity: 0.2,
                      bottom: `${(referenceRange[0] / (yMax - yMin)) * 100}%`,
                    },
                  ]}
                />
              )}

              {/* Blue optimal zone (striped overlay) */}
              {optimalRange && (
                <View
                  style={[
                    styles.singlePointZone,
                    {
                      height: `${
                        ((optimalRange[1] - optimalRange[0]) / (yMax - yMin)) *
                        100
                      }%`,
                      backgroundColor: "#007AFF",
                      opacity: 0.15,
                      bottom: `${(optimalRange[0] / (yMax - yMin)) * 100}%`,
                    },
                  ]}
                />
              )}

              {/* Fallback zone */}
              {fallbackRange && !referenceRange && (
                <View
                  style={[
                    styles.singlePointZone,
                    {
                      height: `${
                        ((fallbackRange[1] - fallbackRange[0]) /
                          (yMax - yMin)) *
                        100
                      }%`,
                      backgroundColor: "#34C759",
                      opacity: 0.1,
                      bottom: `${(fallbackRange[0] / (yMax - yMin)) * 100}%`,
                    },
                  ]}
                />
              )}
            </View>

            {/* Dot positioned at correct Y-value */}
            <View
              style={[
                styles.singlePointDotContainer,
                {
                  bottom: `${
                    ((singlePoint.value - yMin) / (yMax - yMin)) * 150
                  }px`,
                },
              ]}
            >
              {/* Dot */}
              <View style={[styles.singleDot, { backgroundColor: color }]} />
            </View>

            {/* Vertical line extending from dot to X-axis */}
            <View
              style={[
                styles.singlePointLine,
                {
                  backgroundColor: color,
                  bottom: 0,
                  height: `${
                    150 - ((singlePoint.value - yMin) / (yMax - yMin)) * 150
                  }px`,
                  left: "50%",
                  transform: [{ translateX: -1 }],
                },
              ]}
            />

            {/* X-axis line */}
            <View style={styles.xAxisLine} />

            {/* Y-axis line */}
            <View style={styles.yAxisLine} />
          </View>

          {/* Date at bottom */}
          <Text style={[styles.singlePointDate, { color }]}>
            {format(new Date(singlePoint.date), "MM/dd/yy")}
          </Text>
        </View>
      </View>
    );
  }

  // Continue with multi-point chart logic...
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.2;
  const yMin = 0; // Y-axis always starts from 0 for biomarker values
  const yMax = maxValue + padding;

  // Calculate Y-axis range including reference and optimal ranges
  const ranges = [referenceRange, optimalRange].filter(Boolean) as [
    number,
    number
  ][];
  const allValues = [...values, ...ranges.flat()];
  const adjustedYMax = Math.max(...allValues) + Math.max(...allValues) * 0.2;

  // Create fallback range based on data if no ranges provided
  const fallbackRange = !referenceRange
    ? ([Math.max(0, minValue * 0.8), maxValue * 1.2] as [number, number])
    : null;

  // Color function based on value and ranges
  const getLineColor = (value: number) => {
    if (optimalRange && value >= optimalRange[0] && value <= optimalRange[1]) {
      return "#007AFF"; // Blue for optimal
    } else if (
      referenceRange &&
      value >= referenceRange[0] &&
      value <= referenceRange[1]
    ) {
      return "#34C759"; // Green for normal
    } else {
      return "#FF9500"; // Orange for abnormal
    }
  };

  // Multi-colored line decorator with cubic Bézier curves
  const MultiColorDecorator = ({ x, y, data: chartData }: any) => {
    const elements = [];

    // Helper function to calculate control points for smooth curves
    const getControlPoints = (i: number) => {
      const smoothing = 0.4; // Increased smoothing for more pronounced curves

      // Get current and adjacent points
      const current = { x: x(i), y: y(chartData[i]) };
      const next = { x: x(i + 1), y: y(chartData[i + 1]) };

      // Get previous and next-next points for better curve calculation
      const prev =
        i > 0
          ? { x: x(i - 1), y: y(chartData[i - 1]) }
          : { x: current.x - (next.x - current.x), y: current.y };

      const nextNext =
        i < chartData.length - 2
          ? { x: x(i + 2), y: y(chartData[i + 2]) }
          : { x: next.x + (next.x - current.x), y: next.y };

      // Calculate tangent vectors for smooth curves
      const tangent1 = {
        x: (next.x - prev.x) * smoothing,
        y: (next.y - prev.y) * smoothing,
      };

      const tangent2 = {
        x: (nextNext.x - current.x) * smoothing,
        y: (nextNext.y - current.y) * smoothing,
      };

      // Control points for cubic Bézier curve
      const cp1x = current.x + tangent1.x;
      const cp1y = current.y + tangent1.y;
      const cp2x = next.x - tangent2.x;
      const cp2y = next.y - tangent2.y;

      return { cp1x, cp1y, cp2x, cp2y };
    };

    // Add cubic Bézier curve segments between points
    for (let i = 0; i < chartData.length - 1; i++) {
      const currentValue = chartData[i];
      const nextValue = chartData[i + 1];

      // Determine color based on the current point's zone
      const segmentColor = getLineColor(currentValue);

      // Get start and end points
      const x1 = x(i);
      const y1 = y(currentValue);
      const x2 = x(i + 1);
      const y2 = y(nextValue);

      let pathData;

      // Special handling for 2-point curves
      if (chartData.length === 2) {
        const midX = (x1 + x2) / 2;
        const cp1x = x1 + (x2 - x1) * 0.3;
        const cp1y = y1;
        const cp2x = x2 - (x2 - x1) * 0.3;
        const cp2y = y2;
        pathData = `M ${x1} ${y1} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x2} ${y2}`;
      } else {
        // Calculate control points for smooth curve
        const { cp1x, cp1y, cp2x, cp2y } = getControlPoints(i);
        pathData = `M ${x1} ${y1} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x2} ${y2}`;
      }

      elements.push(
        React.createElement(Path, {
          key: `curve-${i}`,
          d: pathData,
          stroke: segmentColor,
          strokeWidth: 3,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "none",
        })
      );
    }

    // Add dots for each point with zone-based colors
    chartData.forEach((value: number, index: number) => {
      const isLatest = index === chartData.length - 1;
      const isSelected = selectedPointIndex === index;
      const color = getLineColor(value);

      // Create touchable area around each dot
      elements.push(
        React.createElement(Circle, {
          key: `touch-area-${index}`,
          cx: x(index),
          cy: y(value),
          r: 20, // Larger touch area
          fill: "transparent",
          onPress: () => setSelectedPointIndex(index),
        })
      );

      elements.push(
        React.createElement(Circle, {
          key: `point-${index}`,
          cx: x(index),
          cy: y(value),
          r: isSelected ? 10 : isLatest ? 8 : 4,
          stroke: color,
          strokeWidth: 2,
          fill: isLatest || isSelected ? color : "white",
        })
      );

      // Show value bubble for selected point
      if (isSelected) {
        const bubbleX = x(index);
        const bubbleY = y(value) - 30;

        // White bubble background
        elements.push(
          React.createElement(Rect, {
            key: `bubble-bg-${index}`,
            x: bubbleX - 25,
            y: bubbleY - 10,
            width: 50,
            height: 20,
            rx: 10,
            fill: "white",
            stroke: "#E5E5E7",
            strokeWidth: 1,
          })
        );

        // Value text in bubble
        elements.push(
          React.createElement(
            "text",
            {
              key: `bubble-text-${index}`,
              x: bubbleX,
              y: bubbleY + 5,
              textAnchor: "middle",
              fontSize: 12,
              fontWeight: "600",
              fill: color,
            },
            `${value}`
          )
        );

        // Vertical guide line to X-axis
        elements.push(
          React.createElement("line", {
            key: `guide-line-${index}`,
            x1: bubbleX,
            y1: y(value), // Start from center of the dot
            x2: bubbleX,
            y2: y(yMin), // End at X-axis (yMin = 0)
            stroke: color,
            strokeWidth: 1,
            strokeDasharray: "3,3",
            opacity: 0.6,
          })
        );
      }
    });

    return React.createElement(G, {}, ...elements);
  };

  // Background zones with horizontal rectangles
  const BackgroundZones = ({ x, y }: any) => {
    const zones = [];
    const chartWidth = x(values.length - 1) - x(0);
    const chartStartX = x(0);

    // Abnormal HIGH zone (above normal range) - Gray
    if (referenceRange) {
      const abnormalHighY = y(yMax);
      const abnormalHighHeight = y(referenceRange[1]) - y(yMax);

      if (abnormalHighHeight > 0) {
        zones.push(
          React.createElement(Rect, {
            key: "abnormal-high-zone",
            x: chartStartX,
            y: abnormalHighY,
            width: chartWidth,
            height: abnormalHighHeight,
            fill: "#8E8E93",
            fillOpacity: 0.2,
          })
        );
      }
    }

    // Normal range zone - Green
    if (referenceRange) {
      const normalY = y(referenceRange[1]);
      const normalHeight = y(referenceRange[0]) - y(referenceRange[1]);

      zones.push(
        React.createElement(Rect, {
          key: "normal-zone",
          x: chartStartX,
          y: normalY,
          width: chartWidth,
          height: normalHeight,
          fill: "#34C759",
          fillOpacity: 0.2,
        })
      );
    }

    // Optimal zone (blue striped overlay) - Blue over green
    if (optimalRange) {
      const optimalY = y(optimalRange[1]);
      const optimalHeight = y(optimalRange[0]) - y(optimalRange[1]);

      zones.push(
        React.createElement(Rect, {
          key: "optimal-zone",
          x: chartStartX,
          y: optimalY,
          width: chartWidth,
          height: optimalHeight,
          fill: "#007AFF",
          fillOpacity: 0.15,
        })
      );
    }

    // Abnormal LOW zone (below normal range) - Gray
    if (referenceRange) {
      const abnormalLowY = y(referenceRange[0]);
      const abnormalLowHeight = y(yMin) - y(referenceRange[0]);

      if (abnormalLowHeight > 0) {
        zones.push(
          React.createElement(Rect, {
            key: "abnormal-low-zone",
            x: chartStartX,
            y: abnormalLowY,
            width: chartWidth,
            height: abnormalLowHeight,
            fill: "#8E8E93",
            fillOpacity: 0.2,
          })
        );
      }
    }

    // Add fallback range if no normal range provided
    if (fallbackRange && !referenceRange) {
      const fallbackY = y(fallbackRange[1]);
      const fallbackHeight = y(fallbackRange[0]) - y(fallbackRange[1]);

      zones.push(
        React.createElement(Rect, {
          key: "fallback-zone",
          x: chartStartX,
          y: fallbackY,
          width: chartWidth,
          height: fallbackHeight,
          fill: "#34C759",
          fillOpacity: 0.1,
        })
      );
    }

    return React.createElement(G, {}, ...zones);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "MM/dd/yy");
  };

  const latestValue = values[values.length - 1];
  const latestDate = dates[dates.length - 1];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dynamics</Text>
        <Text style={styles.timeRange}>all time</Text>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          <LineChart
            style={{ flex: 1 }}
            data={values}
            svg={{ stroke: "transparent" }} // Hide default line since we draw custom segments
            contentInset={{ top: 20, bottom: 20, left: 20, right: 20 }}
            yMin={yMin}
            yMax={yMax}
          >
            <BackgroundZones />
            <Grid />
            <MultiColorDecorator />
          </LineChart>

          {/* X-axis line */}
          <View style={styles.chartXAxisLine} />

          {/* Y-axis line */}
          <View style={styles.chartYAxisLine} />
        </View>

        {/* Latest value indicator */}
        <View style={styles.valueIndicator}>
          <Text
            style={[styles.currentValue, { color: getLineColor(latestValue) }]}
          >
            {latestValue} {unit}
          </Text>
        </View>

        {/* X-axis dates */}
        <View style={styles.xAxisContainer}>
          <Text style={[styles.dateLabel, styles.earliestDate]}>
            {formatDate(dates[0])}
          </Text>
          {selectedPointIndex !== null &&
            selectedPointIndex > 0 &&
            selectedPointIndex < dates.length - 1 && (
              <Text style={[styles.dateLabel, styles.selectedDate]}>
                {formatDate(dates[selectedPointIndex])}
              </Text>
            )}
          <Text style={[styles.dateLabel, styles.latestDate]}>
            {formatDate(latestDate)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginRight: 8,
  },
  timeRange: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF3B30",
  },
  chartContainer: {
    height: 200,
    position: "relative",
  },
  chart: {
    height: 150,
    marginBottom: 10,
  },
  valueIndicator: {
    position: "absolute",
    top: 10,
    right: 20,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  xAxisContainer: {
    flexDirection: "row",
    position: "relative",
    height: 20,
    paddingHorizontal: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: "#8E8E93",
    position: "absolute",
  },
  latestDate: {
    color: "#34C759",
    fontWeight: "600",
    right: "20%", // Position at ~80% from left
  },
  earliestDate: {
    color: "#8E8E93",
    fontWeight: "600",
    left: "10%", // Position at ~10% from left
  },
  selectedDate: {
    color: "#007AFF",
    fontWeight: "600",
    right: "20%", // Position at ~80% from left
  },
  noDataContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  noDataText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  singlePointContainer: {
    height: 200,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    position: "relative",
  },
  singlePointChart: {
    width: "100%",
    height: 150,
    position: "relative",
    marginBottom: 16,
  },
  singlePointBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  singlePointZone: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  singlePointDotContainer: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -8 }],
  },
  singlePointLine: {
    position: "absolute",
    width: 2,
  },
  singleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    zIndex: 2,
  },
  singlePointDate: {
    fontSize: 14,
    fontWeight: "600",
  },
  xAxisLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E5E7",
  },
  yAxisLine: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#E5E5E7",
  },
  chartXAxisLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E5E7",
  },
  chartYAxisLine: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#E5E5E7",
  },
});
