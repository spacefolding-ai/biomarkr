import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";
import { Grid, LineChart } from "react-native-svg-charts";
import { useLabReportsStore } from "../store/useLabReportsStore";

// ========================= TYPES =========================
interface DataPoint {
  date: string;
  value: number;
  abnormal_flag?: string;
  report_id: string;
}

interface BiomarkerTrendChartProps {
  data: DataPoint[];
  unit: string;
  markerName: string;
  referenceRange?: [number, number];
  optimalRange?: [number, number];
  navigation?: any;
}

interface ChartRange {
  yMin: number;
  yMax: number;
  fallbackRange?: [number, number];
}

// ========================= HELPER FUNCTIONS =========================

// Helper function to expand reference range for visual zone display
const getExpandedReferenceRange = (
  referenceRange?: [number, number]
): [number, number] | undefined => {
  if (!referenceRange) return undefined;

  const rangeSpan = referenceRange[1] - referenceRange[0];
  const expansionFactor = 0.15; // Expand by 15% on each side
  const expansion = rangeSpan * expansionFactor;

  return [
    Math.max(0, referenceRange[0] - expansion), // Don't go below 0
    referenceRange[1] + expansion,
  ];
};

// Helper function to get color based on Y position (which zone the line is in)
const getColorForYPosition = (
  yValue: number,
  referenceRange?: [number, number]
): string => {
  if (!referenceRange) return "#FF9500"; // Orange if no reference range

  if (yValue >= referenceRange[0] && yValue <= referenceRange[1]) {
    return "#34C759"; // Green for normal zone
  } else {
    return "#FF9500"; // Orange for abnormal zones
  }
};

const getLineColorForValue = (
  value: number,
  referenceRange?: [number, number],
  optimalRange?: [number, number]
) => {
  // Use original reference range for color determination, not expanded
  if (
    referenceRange &&
    value >= referenceRange[0] &&
    value <= referenceRange[1]
  ) {
    return "#34C759"; // Green for normal
  } else {
    return "#FF9500"; // Orange for abnormal
  }
};

const getAbnormalFlagIcon = (flag?: string) => {
  const normalizedFlag = flag?.toLowerCase();
  if (normalizedFlag === "very high") {
    return { icon: "▲", color: "#FF3B30" };
  } else if (normalizedFlag === "high") {
    return { icon: "▲", color: "#FF9500" };
  } else if (normalizedFlag === "very low") {
    return { icon: "▼", color: "#FF3B30" };
  } else if (normalizedFlag === "low") {
    return { icon: "▼", color: "#FF9500" };
  } else {
    return { icon: "●", color: "#34C759" };
  }
};

const formatListDate = (date: string) => {
  return format(new Date(date), "MMM d");
};

const formatChartDate = (date: string) => {
  return format(new Date(date), "MM/dd/yy");
};

const calculateChartRange = (
  values: number[],
  referenceRange?: [number, number],
  optimalRange?: [number, number]
): ChartRange => {
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Use expanded reference range for chart scaling to accommodate wider zones
  const expandedReferenceRange = getExpandedReferenceRange(referenceRange);
  const ranges = [expandedReferenceRange || referenceRange].filter(Boolean) as [
    number,
    number
  ][];
  const allValues = [...values, ...ranges.flat()];
  const adjustedYMax = Math.max(...allValues) + Math.max(...allValues) * 0.2;

  const fallbackRange = !referenceRange
    ? ([Math.max(0, minValue * 0.8), maxValue * 1.2] as [number, number])
    : undefined;

  return {
    yMin: 0, // Y-axis always starts from 0 for biomarker values
    yMax: adjustedYMax,
    fallbackRange,
  };
};

const extendDataForPositioning = (values: number[]): number[] => {
  const extendedValues = [...values];
  if (values.length > 1) {
    const realDataLength = values.length;
    const targetPosition = 0.95; // 95%
    const extendedLength = Math.ceil((realDataLength - 1) / targetPosition) + 1;
    const additionalPoints = extendedLength - realDataLength;

    for (let i = 0; i < additionalPoints; i++) {
      extendedValues.push(values[values.length - 1]);
    }
  }
  return extendedValues;
};

// ========================= CHART COMPONENTS =========================

interface SinglePointChartProps {
  dataPoint: DataPoint;
  unit: string;
  referenceRange?: [number, number];
  optimalRange?: [number, number];
}

const SinglePointChart: React.FC<SinglePointChartProps> = ({
  dataPoint,
  unit,
  referenceRange,
  optimalRange,
}) => {
  const color = getLineColorForValue(
    dataPoint.value,
    referenceRange,
    optimalRange
  );

  // Get expanded reference range for visual display
  const expandedReferenceRange = getExpandedReferenceRange(referenceRange);

  // Calculate Y-axis range
  const ranges = [expandedReferenceRange || referenceRange].filter(Boolean) as [
    number,
    number
  ][];
  const allValues = [dataPoint.value, ...ranges.flat()];
  const maxValue = Math.max(...allValues);
  const padding = maxValue * 0.2;
  const yMin = 0;
  const yMax = maxValue + padding;

  // Create fallback range if no reference range provided
  const fallbackRange = !referenceRange
    ? [Math.max(0, dataPoint.value * 0.8), dataPoint.value * 1.2]
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
            {expandedReferenceRange && (
              <>
                {/* Abnormal HIGH zone (above expanded reference range) */}
                <View
                  style={[
                    styles.singlePointZone,
                    {
                      height: `${
                        ((yMax - expandedReferenceRange[1]) / (yMax - yMin)) *
                        100
                      }%`,
                      backgroundColor: "#8E8E93",
                      opacity: 0.2,
                      top: 0,
                    },
                  ]}
                />
                {/* Abnormal LOW zone (below expanded reference range) - extend to bottom */}
                <View
                  style={[
                    styles.singlePointZone,
                    {
                      height: `${
                        ((expandedReferenceRange[0] - yMin) / (yMax - yMin)) *
                          100 +
                        10
                      }%`, // Extra 10% to ensure full coverage to bottom
                      backgroundColor: "#8E8E93",
                      opacity: 0.2,
                      bottom: 0,
                    },
                  ]}
                />
              </>
            )}

            {/* Green normal zone (using expanded range for wider visual display) */}
            {expandedReferenceRange && (
              <View
                style={[
                  styles.singlePointZone,
                  {
                    height: `${
                      ((expandedReferenceRange[1] - expandedReferenceRange[0]) /
                        (yMax - yMin)) *
                      100
                    }%`,
                    backgroundColor: "#34C759",
                    opacity: 0.2,
                    bottom: `${
                      (expandedReferenceRange[0] / (yMax - yMin)) * 100
                    }%`,
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
                      ((fallbackRange[1] - fallbackRange[0]) / (yMax - yMin)) *
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
                bottom: `${((dataPoint.value - yMin) / (yMax - yMin)) * 150}px`,
              },
            ]}
          >
            <View style={[styles.singleDot, { backgroundColor: color }]} />
          </View>

          {/* Full vertical line passing through the dot */}
          <View
            style={[
              styles.singlePointVerticalLine,
              { left: "50%", transform: [{ translateX: -0.5 }] },
            ]}
          />

          {/* X-axis line */}
          <View style={styles.xAxisLine} />
          {/* Y-axis line */}
          <View style={styles.yAxisLine} />
        </View>

        {/* Date at bottom */}
        <Text style={[styles.singlePointDate, { color }]}>
          {formatChartDate(dataPoint.date)}
        </Text>
      </View>

      {/* Biomarker Values List for single point */}
      <View style={styles.valuesList}>
        <View style={styles.valueItem}>
          <Text style={styles.valueDate}>{formatListDate(dataPoint.date)}</Text>
          <View style={styles.valueRight}>
            <Text style={styles.valueText}>
              {dataPoint.value} {unit}
            </Text>
            <Text style={[styles.flagIcon, { color }]}>
              {getAbnormalFlagIcon(dataPoint.abnormal_flag).icon}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

interface BackgroundZonesProps {
  x: any;
  y: any;
  extendedValues: number[];
  referenceRange?: [number, number];
  optimalRange?: [number, number];
  fallbackRange?: [number, number];
  yMin: number;
  yMax: number;
}

const BackgroundZones: React.FC<BackgroundZonesProps> = ({
  x,
  y,
  extendedValues,
  referenceRange,
  optimalRange,
  fallbackRange,
  yMin,
  yMax,
}) => {
  const zones = [];
  const zoneStartX = 0; // Start from Y-axis
  const zoneWidth = x(extendedValues.length - 1); // Extend to full chart width

  // Get expanded reference range for visual display
  const expandedReferenceRange = getExpandedReferenceRange(referenceRange);

  // Abnormal HIGH zone (above normal range) - Gray
  if (expandedReferenceRange) {
    const abnormalHighY = 0; // Start from top of chart
    const abnormalHighHeight = y(expandedReferenceRange[1]); // Extend to top of expanded normal range

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

  // Normal range zone - Green (using expanded range for wider visual display)
  if (expandedReferenceRange) {
    const normalY = y(expandedReferenceRange[1]);
    const normalHeight =
      y(expandedReferenceRange[0]) - y(expandedReferenceRange[1]);

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

  // Abnormal LOW zone (below normal range) - Gray
  if (expandedReferenceRange) {
    const abnormalLowY = y(expandedReferenceRange[0]);
    // Extend to bottom of chart area (including contentInset) by using a large height
    // This ensures the zone extends well beyond the visible chart area
    const abnormalLowHeight = 1000; // Large height to ensure full coverage

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

interface MultiColorDecoratorProps {
  x: any;
  y: any;
  data: number[];
  sortedData: DataPoint[];
  selectedPointIndex: number | null;
  setSelectedPointIndex: (index: number) => void;
  referenceRange?: [number, number];
  optimalRange?: [number, number];
  yMin: number;
  yMax: number;
}

const MultiColorDecorator: React.FC<MultiColorDecoratorProps> = ({
  x,
  y,
  data: chartData,
  sortedData,
  selectedPointIndex,
  setSelectedPointIndex,
  referenceRange,
  optimalRange,
  yMin,
  yMax,
}) => {
  const elements = [];
  const realDataLength = sortedData.length;

  // Helper function to calculate control points for smooth curves
  const getControlPoints = (i: number) => {
    const smoothing = 0.4;

    const current = { x: x(i), y: y(chartData[i]) };
    const next = { x: x(i + 1), y: y(chartData[i + 1]) };

    const prev =
      i > 0
        ? { x: x(i - 1), y: y(chartData[i - 1]) }
        : { x: current.x - (next.x - current.x), y: current.y };

    const nextNext =
      i < realDataLength - 2
        ? { x: x(i + 2), y: y(chartData[i + 2]) }
        : { x: next.x + (next.x - current.x), y: next.y };

    const tangent1 = {
      x: (next.x - prev.x) * smoothing,
      y: (next.y - prev.y) * smoothing,
    };

    const tangent2 = {
      x: (nextNext.x - current.x) * smoothing,
      y: (nextNext.y - current.y) * smoothing,
    };

    const cp1x = current.x + tangent1.x;
    const cp1y = current.y + tangent1.y;
    const cp2x = next.x - tangent2.x;
    const cp2y = next.y - tangent2.y;

    return { cp1x, cp1y, cp2x, cp2y };
  };

  // Helper function to calculate point on cubic Bézier curve
  const getCubicBezierPoint = (
    t: number,
    x1: number,
    y1: number,
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x2: number,
    y2: number
  ) => {
    const mt = 1 - t;
    return {
      x:
        mt * mt * mt * x1 +
        3 * mt * mt * t * cp1x +
        3 * mt * t * t * cp2x +
        t * t * t * x2,
      y:
        mt * mt * mt * y1 +
        3 * mt * mt * t * cp1y +
        3 * mt * t * t * cp2y +
        t * t * t * y2,
    };
  };

  // Helper function to convert Y screen position back to data value
  const getDataValueFromY = (yScreen: number): number => {
    // This is an approximation since we don't have direct access to the inverse y function
    // We'll estimate based on the chart range
    const chartHeight = 150; // Approximate chart height
    const ratio = (chartHeight - yScreen) / chartHeight;
    return yMin + (yMax - yMin) * ratio;
  };

  // Add cubic Bézier curve segments between points (only for real data)
  for (let i = 0; i < realDataLength - 1; i++) {
    const currentValue = chartData[i];
    const nextValue = chartData[i + 1];

    const x1 = x(i);
    const y1 = y(currentValue);
    const x2 = x(i + 1);
    const y2 = y(nextValue);

    let cp1x: number, cp1y: number, cp2x: number, cp2y: number;

    if (realDataLength === 2) {
      cp1x = x1 + (x2 - x1) * 0.3;
      cp1y = y1;
      cp2x = x2 - (x2 - x1) * 0.3;
      cp2y = y2;
    } else {
      const controlPoints = getControlPoints(i);
      cp1x = controlPoints.cp1x;
      cp1y = controlPoints.cp1y;
      cp2x = controlPoints.cp2x;
      cp2y = controlPoints.cp2y;
    }

    // Sample points along the curve and create colored segments
    const numSamples = 20; // Number of segments to create for smooth color transitions
    for (let j = 0; j < numSamples; j++) {
      const t1 = j / numSamples;
      const t2 = (j + 1) / numSamples;

      const point1 = getCubicBezierPoint(
        t1,
        x1,
        y1,
        cp1x,
        cp1y,
        cp2x,
        cp2y,
        x2,
        y2
      );
      const point2 = getCubicBezierPoint(
        t2,
        x1,
        y1,
        cp1x,
        cp1y,
        cp2x,
        cp2y,
        x2,
        y2
      );

      // Get the Y data value at the midpoint to determine color
      const midY = (point1.y + point2.y) / 2;
      const midDataValue = getDataValueFromY(midY);
      const segmentColor = getColorForYPosition(midDataValue, referenceRange);

      // Create a small line segment
      const segmentPath = `M ${point1.x} ${point1.y} L ${point2.x} ${point2.y}`;

      elements.push(
        React.createElement(Path, {
          key: `curve-${i}-segment-${j}`,
          d: segmentPath,
          stroke: segmentColor,
          strokeWidth: 3,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "none",
        })
      );
    }
  }

  // Add dots for each point with zone-based colors (only for real data)
  for (let index = 0; index < realDataLength; index++) {
    const value = chartData[index];
    const isSelected = selectedPointIndex === index;
    const color = getLineColorForValue(value, referenceRange, optimalRange);

    // Create touchable area around each dot
    elements.push(
      React.createElement(Circle, {
        key: `touch-area-${index}`,
        cx: x(index),
        cy: y(value),
        r: 20,
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
      const chartHeight = 150;
      const lineBottom = chartHeight;
      const lineTop = 0;

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

      const bubbleWidth = 50;
      const bubbleHeight = 20;
      const bubbleX = dotX + 25;
      const bubbleY = dotY - bubbleHeight / 2;
      const cornerRadius = 10;
      const pointerSize = 4;

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

      elements.push(
        React.createElement(
          SvgText,
          {
            key: `bubble-text-${index}`,
            x: bubbleX + bubbleWidth / 2,
            y: dotY + 1,
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

interface DateLabelsProps {
  x: any;
  sortedData: DataPoint[];
  selectedPointIndex: number | null;
}

const DateLabels: React.FC<DateLabelsProps> = ({
  x,
  sortedData,
  selectedPointIndex,
}) => {
  const elements = [];

  for (let index = 0; index < sortedData.length; index++) {
    const dataPoint = sortedData[index];
    const isSelected = selectedPointIndex === index;
    const dotX = x(index);

    elements.push(
      React.createElement(
        SvgText,
        {
          key: `date-${index}`,
          x: dotX,
          y: 15,
          textAnchor: "middle",
          fontSize: 12,
          fontWeight: isSelected ? "600" : "400",
          fill: isSelected ? "#007AFF" : "#8E8E93",
        },
        formatChartDate(dataPoint.date)
      )
    );
  }

  return React.createElement(G, {}, ...elements);
};

interface ValuesListProps {
  sortedData: DataPoint[];
  unit: string;
  onNavigate: (reportId: string) => void;
}

const ValuesList: React.FC<ValuesListProps> = ({
  sortedData,
  unit,
  onNavigate,
}) => {
  return (
    <View style={styles.valuesList}>
      {sortedData.map((dataPoint, index) => {
        const flagInfo = getAbnormalFlagIcon(dataPoint.abnormal_flag);
        return (
          <TouchableOpacity
            key={index}
            style={styles.valueItem}
            onPress={() => onNavigate(dataPoint.report_id)}
            activeOpacity={0.7}
          >
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
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const BiomarkerTrendChart: React.FC<BiomarkerTrendChartProps> = ({
  data,
  unit,
  markerName,
  referenceRange,
  optimalRange,
  navigation,
}) => {
  // Initialize with the last data point selected by default (if data exists)
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    data && data.length > 0 ? data.length - 1 : null
  );

  // Get lab reports from store for navigation
  const { reports } = useLabReportsStore();

  // Handle navigation to lab report
  const handleNavigateToLabReport = (reportId: string) => {
    if (!navigation) return;

    const labReport = reports.find((report) => report.id === reportId);
    if (labReport) {
      navigation.navigate("LabReportDetails", {
        labReport,
        isEditMode: false,
      });
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

  // Handle single data point case
  if (data.length === 1) {
    const singlePoint = sortedData[0];
    return (
      <SinglePointChart
        dataPoint={singlePoint}
        unit={unit}
        referenceRange={referenceRange}
        optimalRange={optimalRange}
      />
    );
  }

  // Multi-point chart logic
  const { yMin, yMax, fallbackRange } = calculateChartRange(
    values,
    referenceRange,
    optimalRange
  );
  const extendedValues = extendDataForPositioning(values);

  // Create decorator components that receive x, y from LineChart context
  const BackgroundZonesDecorator = ({ x, y }: any) => (
    <BackgroundZones
      x={x}
      y={y}
      extendedValues={extendedValues}
      referenceRange={referenceRange}
      optimalRange={optimalRange}
      fallbackRange={fallbackRange}
      yMin={yMin}
      yMax={yMax}
    />
  );

  const MultiColorDecoratorWrapper = ({ x, y, data: chartData }: any) => (
    <MultiColorDecorator
      x={x}
      y={y}
      data={chartData}
      sortedData={sortedData}
      selectedPointIndex={selectedPointIndex}
      setSelectedPointIndex={setSelectedPointIndex}
      referenceRange={referenceRange}
      optimalRange={optimalRange}
      yMin={yMin}
      yMax={yMax}
    />
  );

  const DateLabelsWrapper = ({ x }: any) => (
    <DateLabels
      x={x}
      sortedData={sortedData}
      selectedPointIndex={selectedPointIndex}
    />
  );

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
            svg={{ stroke: "transparent" }}
            contentInset={{ top: 20, bottom: 20, left: 20, right: 20 }}
            yMin={yMin}
            yMax={yMax}
          >
            <BackgroundZonesDecorator />
            <Grid />
            <MultiColorDecoratorWrapper />
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
            <DateLabelsWrapper />
          </LineChart>
        </View>
      </View>

      <ValuesList
        sortedData={sortedData}
        unit={unit}
        onNavigate={handleNavigateToLabReport}
      />
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
