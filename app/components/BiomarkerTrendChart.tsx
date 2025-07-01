import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";
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
  // Initialize with the last data point selected by default (if data exists)
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    data && data.length > 0 ? data.length - 1 : null
  );

  const formatListDate = (date: string) => {
    return format(new Date(date), "MMM d");
  };

  const getAbnormalFlagIcon = (flag?: string) => {
    const normalizedFlag = flag?.toLowerCase();
    if (normalizedFlag === "very high") {
      return { icon: "▲", color: "#FF3B30" }; // Red triangle
    } else if (normalizedFlag === "high") {
      return { icon: "▲", color: "#FF9500" }; // Orange triangle
    } else if (normalizedFlag === "very low") {
      return { icon: "▼", color: "#FF3B30" }; // Red triangle down
    } else if (normalizedFlag === "low") {
      return { icon: "▼", color: "#FF9500" }; // Orange triangle down
    } else {
      return { icon: "●", color: "#34C759" }; // Green circle
    }
  };

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

  // Update selected index to match sorted data (last item)
  useEffect(() => {
    setSelectedPointIndex(sortedData.length - 1);
  }, [data]);

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

            {/* Full vertical line passing through the dot */}
            <View
              style={[
                styles.singlePointVerticalLine,
                {
                  left: "50%",
                  transform: [{ translateX: -0.5 }],
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

        {/* Biomarker Values List for single point */}
        <View style={styles.valuesList}>
          <View style={styles.valueItem}>
            <Text style={styles.valueDate}>
              {formatListDate(singlePoint.date)}
            </Text>
            <View style={styles.valueRight}>
              <Text style={styles.valueText}>
                {singlePoint.value} {unit}
              </Text>
              <Text style={[styles.flagIcon, { color }]}>
                {getAbnormalFlagIcon(singlePoint.abnormal_flag).icon}
              </Text>
            </View>
          </View>
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

  // Create extended data array to position last data point at 80% of X-axis
  const extendedValues = [...values];
  if (values.length > 1) {
    // Calculate how many additional points needed to make last real point at 80%
    const realDataLength = values.length;
    const targetPosition = 0.95; // 95%
    const extendedLength = Math.ceil((realDataLength - 1) / targetPosition) + 1;
    const additionalPoints = extendedLength - realDataLength;

    // Add duplicate values to extend the X-axis (these won't be drawn)
    for (let i = 0; i < additionalPoints; i++) {
      extendedValues.push(values[values.length - 1]); // Repeat last value
    }
  }

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

    // Only use the real data values for drawing, not the extended ones
    const realDataLength = values.length;

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
        i < realDataLength - 2
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

    // Add cubic Bézier curve segments between points (only for real data)
    for (let i = 0; i < realDataLength - 1; i++) {
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
      if (realDataLength === 2) {
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

    // Add dots for each point with zone-based colors (only for real data)
    for (let index = 0; index < realDataLength; index++) {
      const value = chartData[index];
      const isLatest = index === realDataLength - 1;
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
          r: isSelected ? 10 : 4,
          stroke: color,
          strokeWidth: 2,
          fill: isSelected ? color : "white",
        })
      );

      // Show vertical line for selected point
      if (isSelected) {
        const lineX = x(index);
        // Extend line to full chart height to connect with X-axis
        const chartHeight = 150; // Chart container height
        const lineBottom = chartHeight; // Bottom of chart container (X-axis position)
        const lineTop = 0; // Top of chart container

        elements.push(
          React.createElement(Path, {
            key: `vertical-line-${index}`,
            d: `M ${lineX} ${lineBottom} L ${lineX} ${lineTop}`,
            stroke: "#007AFF",
            strokeWidth: 1,
            strokeDasharray: "3,3",
            opacity: 0.5,
          })
        );
      }

      // Show value bubble for selected point only
      if (isSelected) {
        const dotX = x(index);
        const dotY = y(value);

        // Position tooltip to the right of the dot
        const bubbleWidth = 50; // Reduced width for less internal padding
        const bubbleHeight = 20; // Reduced height for less internal padding
        const bubbleX = dotX + 25; // Distance from dot to bubble
        const bubbleY = dotY - bubbleHeight / 2; // Vertically centered on dot
        const cornerRadius = 10; // Corner radius for pill shape
        const pointerSize = 4; // Small pointer extension

        // Unified speech bubble with integrated pointer
        const tooltipPath = `
          M ${bubbleX + cornerRadius} ${bubbleY}
          L ${bubbleX + bubbleWidth - cornerRadius} ${bubbleY}
          Q ${bubbleX + bubbleWidth} ${bubbleY} ${bubbleX + bubbleWidth} ${
          bubbleY + cornerRadius
        }
          L ${bubbleX + bubbleWidth} ${bubbleY + bubbleHeight - cornerRadius}
          Q ${bubbleX + bubbleWidth} ${bubbleY + bubbleHeight} ${
          bubbleX + bubbleWidth - cornerRadius
        } ${bubbleY + bubbleHeight}
          L ${bubbleX + cornerRadius} ${bubbleY + bubbleHeight}
          Q ${bubbleX} ${bubbleY + bubbleHeight} ${bubbleX} ${
          bubbleY + bubbleHeight - cornerRadius
        }
          L ${bubbleX} ${dotY + pointerSize}
          L ${bubbleX - 8} ${dotY}
          L ${bubbleX} ${dotY - pointerSize}
          L ${bubbleX} ${bubbleY + cornerRadius}
          Q ${bubbleX} ${bubbleY} ${bubbleX + cornerRadius} ${bubbleY}
          Z
        `;

        elements.push(
          React.createElement(Path, {
            key: `tooltip-${index}`,
            d: tooltipPath,
            fill: "white",
            stroke: "#E5E5E7",
            strokeWidth: 1,
            strokeLinejoin: "round",
          })
        );

        // Value text in tooltip - vertically centered
        elements.push(
          React.createElement(
            SvgText,
            {
              key: `bubble-text-${index}`,
              x: bubbleX + bubbleWidth / 2, // Center in the tooltip
              y: dotY + 1, // Slight adjustment for perfect vertical centering
              textAnchor: "middle",
              fontSize: 14,
              fontWeight: "600",
              fill: color,
              alignmentBaseline: "middle",
            },
            `${value}`
          )
        );
      }
    }

    return React.createElement(G, {}, ...elements);
  };

  // Background zones with horizontal rectangles
  const BackgroundZones = ({ x, y }: any) => {
    const zones = [];
    // Start zones from Y-axis (x=0) and extend to the full chart width
    const zoneStartX = 0; // Start from Y-axis
    const zoneWidth = x(extendedValues.length - 1); // Extend to full chart width

    // Abnormal HIGH zone (above normal range) - Gray
    if (referenceRange) {
      const abnormalHighY = y(yMax);
      const abnormalHighHeight = y(referenceRange[1]) - y(yMax);

      if (abnormalHighHeight > 0) {
        zones.push(
          React.createElement(Rect, {
            key: "abnormal-high-zone",
            x: zoneStartX,
            y: abnormalHighY,
            width: zoneWidth,
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
          x: zoneStartX,
          y: normalY,
          width: zoneWidth,
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
          x: zoneStartX,
          y: optimalY,
          width: zoneWidth,
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
            x: zoneStartX,
            y: abnormalLowY,
            width: zoneWidth,
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
          x: zoneStartX,
          y: fallbackY,
          width: zoneWidth,
          height: fallbackHeight,
          fill: "#34C759",
          fillOpacity: 0.1,
        })
      );
    }

    return React.createElement(G, {}, ...zones);
  };

  // Date labels positioned directly under each biomarker dot
  const DateLabels = ({ x }: any) => {
    const elements = [];

    // Only show dates for real data points (not extended ones)
    for (let index = 0; index < sortedData.length; index++) {
      const dataPoint = sortedData[index];
      const isSelected = selectedPointIndex === index;
      const dotX = x(index); // Same X position as the biomarker dot

      elements.push(
        React.createElement(
          SvgText,
          {
            key: `date-${index}`,
            x: dotX,
            y: 15, // Position below the chart area
            textAnchor: "middle", // Center the text under the dot
            fontSize: 12,
            fontWeight: isSelected ? "600" : "400",
            fill: isSelected ? "#007AFF" : "#8E8E93",
          },
          formatDate(dataPoint.date)
        )
      );
    }

    return React.createElement(G, {}, ...elements);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "MM/dd/yy");
  };

  const latestValue = values[values.length - 1];

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
            data={extendedValues}
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

        {/* X-axis dates - positioned directly under biomarker dots */}
        <View style={styles.xAxisContainer}>
          <LineChart
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 30,
              opacity: 1,
            }}
            data={extendedValues}
            contentInset={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <DateLabels />
          </LineChart>
        </View>
      </View>

      {/* Biomarker Values List */}
      <View style={styles.valuesList}>
        {sortedData.map((dataPoint, index) => {
          const flagInfo = getAbnormalFlagIcon(dataPoint.abnormal_flag);
          return (
            <View key={index} style={styles.valueItem}>
              <Text style={styles.valueDate}>
                {formatListDate(dataPoint.date)}
              </Text>
              <View style={styles.valueRight}>
                <Text style={styles.valueText}>
                  {dataPoint.value} {unit}
                </Text>
                <Text style={[styles.flagIcon, { color: flagInfo.color }]}>
                  {flagInfo.icon}
                </Text>
              </View>
            </View>
          );
        })}
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

  xAxisContainer: {
    flexDirection: "row",
    position: "relative",
    height: 30,
    paddingHorizontal: 20,
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
  singlePointVerticalLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#007AFF",
    opacity: 0.5,
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
  valuesList: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  valueItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  valueDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  valueRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8E8E93",
    marginRight: 8,
  },
  flagIcon: {
    fontSize: 16,
    fontWeight: "600",
  },
});
