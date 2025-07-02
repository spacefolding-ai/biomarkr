import { useCallback, useEffect, useRef } from "react";
import { getAllLabReports } from "../services/labReports";
import { useAuthStore } from "../store/useAuthStore";
import { useLabReportsStore } from "../store/useLabReportsStore";
import { ExtractionStatus } from "../types/ExtractionStatus.enum";

interface UseLabReportsPollingOptions {
  /** Polling interval in milliseconds for active reports (default: 3000ms) */
  activeInterval?: number;
  /** Polling interval in milliseconds for inactive reports (default: 10000ms) */
  inactiveInterval?: number;
  /** Whether to enable polling (default: true) */
  enabled?: boolean;
  /** Callback when a report becomes "done" - useful for triggering biomarkers refresh */
  onReportCompleted?: (reportId: string, reportData: any) => void;
}

export function useLabReportsPolling(
  options: UseLabReportsPollingOptions = {}
) {
  const {
    activeInterval = 3000, // 3 seconds for active processing
    inactiveInterval = 10000, // 10 seconds for inactive
    enabled = true,
    onReportCompleted,
  } = options;

  const { user } = useAuthStore();
  const { reports, setReports, setLoading } = useLabReportsStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isPollingRef = useRef<boolean>(false);

  // Check if any reports are actively being processed
  const hasActiveReports = useCallback(() => {
    return reports.some(
      (report) =>
        report.extraction_status === ExtractionStatus.PENDING ||
        report.extraction_status === ExtractionStatus.PROCESSING ||
        report.extraction_status === ExtractionStatus.SAVING
    );
  }, [reports]);

  // Check if all reports are completed (done, error, or unsupported) - no need to poll
  const allReportsCompleted = useCallback(() => {
    if (reports.length === 0) return false;

    return reports.every(
      (report) =>
        report.extraction_status === ExtractionStatus.DONE ||
        report.extraction_status === ExtractionStatus.ERROR ||
        report.extraction_status === ExtractionStatus.UNSUPPORTED
    );
  }, [reports]);

  // Determine if we should poll and at what interval
  const getPollingStrategy = useCallback(() => {
    if (allReportsCompleted()) {
      return { shouldPoll: false, interval: 0, status: "COMPLETED" };
    }

    const isActive = hasActiveReports();
    return {
      shouldPoll: true,
      interval: isActive ? activeInterval : inactiveInterval,
      status: isActive ? "ACTIVE" : "INACTIVE",
    };
  }, [allReportsCompleted, hasActiveReports, activeInterval, inactiveInterval]);

  // Fetch lab reports and update store if changes detected
  const fetchLabReports = useCallback(async () => {
    if (!user?.id || isPollingRef.current) {
      return;
    }

    try {
      isPollingRef.current = true;
      console.log("🔄 Polling lab reports...");

      const freshReports = await getAllLabReports();

      // Compare with current reports to detect changes
      const currentReportsById = new Map(reports.map((r) => [r.id, r]));
      const freshReportsById = new Map(freshReports.map((r) => [r.id, r]));

      let hasChanges = false;

      // Check for new or updated reports
      for (const freshReport of freshReports) {
        const currentReport = currentReportsById.get(freshReport.id);

        if (!currentReport) {
          console.log("📥 New report detected:", {
            id: freshReport.id,
            laboratory_name: freshReport.laboratory_name,
            extraction_status: freshReport.extraction_status,
          });
          hasChanges = true;
        } else if (
          currentReport.extraction_status !== freshReport.extraction_status ||
          currentReport.laboratory_name !== freshReport.laboratory_name ||
          currentReport.patient_name !== freshReport.patient_name ||
          currentReport.report_date !== freshReport.report_date
        ) {
          console.log("📝 Updated report detected:", {
            id: freshReport.id,
            old_status: currentReport.extraction_status,
            new_status: freshReport.extraction_status,
            laboratory_name: freshReport.laboratory_name,
          });
          hasChanges = true;

          // Check if report just became "done" - trigger biomarkers refresh
          if (
            currentReport.extraction_status !== ExtractionStatus.DONE &&
            freshReport.extraction_status === ExtractionStatus.DONE
          ) {
            console.log("🎉 Report completed! Triggering biomarkers refresh:", {
              reportId: freshReport.id,
              laboratory_name: freshReport.laboratory_name,
            });
            onReportCompleted?.(freshReport.id, freshReport);
          }
        }
      }

      // Check for deleted reports
      for (const currentReport of reports) {
        if (!freshReportsById.has(currentReport.id)) {
          console.log("🗑️ Deleted report detected:", {
            id: currentReport.id,
            laboratory_name: currentReport.laboratory_name,
          });
          hasChanges = true;
        }
      }

      if (hasChanges) {
        console.log(
          "✅ Changes detected, updating store with",
          freshReports.length,
          "reports"
        );
        setReports(freshReports);
      } else {
        console.log("📊 No changes detected");
      }

      lastFetchTimeRef.current = Date.now();
    } catch (error) {
      console.error("❌ Error polling lab reports:", error);
    } finally {
      isPollingRef.current = false;
    }
  }, [user?.id, reports, setReports, onReportCompleted]);

  // Start/restart polling with appropriate interval
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const strategy = getPollingStrategy();

    if (!strategy.shouldPoll) {
      console.log(
        `⏹️ All reports completed - stopping polling (${strategy.status})`
      );
      return;
    }

    console.log(
      `🚀 Starting polling every ${strategy.interval}ms (${strategy.status})`
    );
    intervalRef.current = setInterval(fetchLabReports, strategy.interval);
  }, [getPollingStrategy, fetchLabReports]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      console.log("⏹️ Stopping polling");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initial fetch when user is available
  useEffect(() => {
    if (user?.id && enabled) {
      console.log("👤 User authenticated, performing initial fetch");
      fetchLabReports();
    }
  }, [user?.id, enabled, fetchLabReports]);

  // Set up polling based on user auth and active reports
  useEffect(() => {
    if (!user?.id || !enabled) {
      stopPolling();
      return;
    }

    // Start polling
    startPolling();

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [user?.id, enabled, startPolling, stopPolling]);

  // Restart polling when report activity changes
  useEffect(() => {
    if (user?.id && enabled && reports.length > 0) {
      const currentStrategy = getPollingStrategy();
      const wasPolling = !!intervalRef.current;

      // If we should stop polling (all completed) but are currently polling
      if (!currentStrategy.shouldPoll && wasPolling) {
        console.log("🏁 All reports completed - stopping polling");
        stopPolling();
        return;
      }

      // If we should be polling but aren't, or if interval needs to change
      if (currentStrategy.shouldPoll) {
        const currentInterval = intervalRef.current
          ? hasActiveReports()
            ? activeInterval
            : inactiveInterval
          : 0;

        if (!wasPolling || currentInterval !== currentStrategy.interval) {
          console.log(
            `🔄 Report status changed - restarting polling (${currentStrategy.status})`
          );
          startPolling();
        }
      }
    }
  }, [
    reports,
    user?.id,
    enabled,
    activeInterval,
    inactiveInterval,
    getPollingStrategy,
    stopPolling,
    hasActiveReports,
    startPolling,
  ]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    console.log("🔄 Manual refresh requested");
    setLoading(true);
    try {
      await fetchLabReports();

      // After manual refresh, check if we need to restart polling
      // (in case new reports were added or status changed)
      const strategy = getPollingStrategy();
      if (strategy.shouldPoll && !intervalRef.current) {
        console.log("🔄 Restarting polling after manual refresh");
        startPolling();
      }
    } finally {
      setLoading(false);
    }
  }, [fetchLabReports, getPollingStrategy, startPolling, setLoading]);

  return {
    refresh,
    isPolling: !!intervalRef.current,
    hasActiveReports: hasActiveReports(),
    allReportsCompleted: allReportsCompleted(),
    lastFetchTime: lastFetchTimeRef.current,
  };
}
