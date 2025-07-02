import { useEffect, useRef } from "react";
import { getAllBiomarkers } from "../services/biomarkers";
import { useAuthStore } from "../store/useAuthStore";
import { useBiomarkersStore } from "../store/useBiomarkersStore";

interface UseBiomarkersPollingOptions {
  /** Polling interval in milliseconds (default: 15000ms - 15 seconds) */
  interval?: number;
  /** Whether to enable polling (default: true) */
  enabled?: boolean;
}

export function useBiomarkersPolling(
  options: UseBiomarkersPollingOptions = {}
) {
  const {
    interval = 15000, // 15 seconds - biomarkers change less frequently
    enabled = true,
  } = options;

  const { user } = useAuthStore();
  const { biomarkers, setBiomarkers, setLoading } = useBiomarkersStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isPollingRef = useRef<boolean>(false);
  const stopAfterNextRefreshRef = useRef<boolean>(false);

  // Fetch biomarkers and update store if changes detected
  const fetchBiomarkers = async () => {
    if (!user?.id || isPollingRef.current) {
      return;
    }

    try {
      isPollingRef.current = true;
      console.log("🔄 Polling biomarkers...");

      const freshBiomarkers = await getAllBiomarkers();

      // Compare with current biomarkers to detect changes
      const currentBiomarkersById = new Map(biomarkers.map((b) => [b.id, b]));
      const freshBiomarkersById = new Map(
        freshBiomarkers.map((b) => [b.id, b])
      );

      let hasChanges = false;

      // Check for new biomarkers
      for (const freshBiomarker of freshBiomarkers) {
        if (!currentBiomarkersById.has(freshBiomarker.id)) {
          console.log("📥 New biomarker detected:", {
            id: freshBiomarker.id,
            marker_name: freshBiomarker.marker_name,
            report_id: freshBiomarker.report_id,
          });
          hasChanges = true;
        }
      }

      // Check for deleted biomarkers
      for (const currentBiomarker of biomarkers) {
        if (!freshBiomarkersById.has(currentBiomarker.id)) {
          console.log("🗑️ Deleted biomarker detected:", {
            id: currentBiomarker.id,
            marker_name: currentBiomarker.marker_name,
          });
          hasChanges = true;
        }
      }

      if (hasChanges) {
        console.log(
          "✅ Biomarker changes detected, updating store with",
          freshBiomarkers.length,
          "biomarkers"
        );
        setBiomarkers(freshBiomarkers);
      } else {
        console.log("📊 No biomarker changes detected");
      }

      // Check if we should stop polling after this refresh
      if (stopAfterNextRefreshRef.current) {
        console.log(
          "🏁 Stopping biomarkers polling after successful refresh (as requested)"
        );
        stopAfterNextRefreshRef.current = false;
        stopPolling();
      }

      lastFetchTimeRef.current = Date.now();
    } catch (error) {
      console.error("❌ Error polling biomarkers:", error);
    } finally {
      isPollingRef.current = false;
    }
  };

  // Start polling
  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    console.log(`🚀 Starting biomarkers polling every ${interval}ms`);
    intervalRef.current = setInterval(fetchBiomarkers, interval);
  };

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      console.log("⏹️ Stopping biomarkers polling");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Initial fetch when user is available
  useEffect(() => {
    if (user?.id && enabled) {
      console.log("👤 User authenticated, performing initial biomarkers fetch");
      fetchBiomarkers();
    }
  }, [user?.id, enabled]);

  // Set up polling based on user auth
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
  }, [user?.id, enabled, interval]);

  // Manual refresh function
  const refresh = async () => {
    console.log("🔄 Manual biomarkers refresh requested");
    setLoading(true);
    try {
      await fetchBiomarkers();
    } finally {
      setLoading(false);
    }
  };

  // Refresh and stop polling (for lab report completion scenarios)
  const refreshAndStop = async () => {
    console.log(
      "🔄 Biomarkers refresh requested with auto-stop after completion"
    );
    stopAfterNextRefreshRef.current = true;
    setLoading(true);
    try {
      await fetchBiomarkers();
    } finally {
      setLoading(false);
    }
  };

  // Resume polling (when new reports start processing)
  const resumePolling = () => {
    if (!intervalRef.current && user?.id && enabled) {
      console.log("🔄 Resuming biomarkers polling");
      startPolling();
    }
  };

  return {
    refresh,
    refreshAndStop,
    resumePolling,
    isPolling: !!intervalRef.current,
    lastFetchTime: lastFetchTimeRef.current,
  };
}
