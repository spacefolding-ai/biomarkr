import React, { memo, useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import { getImageUrl } from "../utils/file";
import { Thumbnail } from "./Thumbnail";

interface ThumbnailLoaderProps {
  path: string | null | undefined;
  size?: number;
}

const ThumbnailLoaderComponent: React.FC<ThumbnailLoaderProps> = ({
  path,
  size = 80,
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const loadedPathRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Skip loading if we already loaded this exact path
    if (loadedPathRef.current === path && url !== null) {
      setLoading(false);
      return;
    }

    // Reset states for new path
    if (loadedPathRef.current !== path) {
      setLoading(true);
      setError(false);
      setUrl(null);
    }

    const load = async () => {
      if (!path) {
        if (mountedRef.current) {
          setUrl(null);
          setLoading(false);
          setError(false);
          loadedPathRef.current = null;
        }
        return;
      }

      try {
        const resolved = await getImageUrl(path);
        if (mountedRef.current) {
          setUrl(resolved);
          setLoading(false);
          setError(false);
          loadedPathRef.current = path; // Mark this path as successfully loaded
        }
      } catch (loadError) {
        if (mountedRef.current) {
          setUrl(null);
          setLoading(false);
          setError(true);
          loadedPathRef.current = path; // Mark as attempted (to prevent retry loops)
        }
      }
    };

    load();
  }, [path, url]);

  if (loading && !url) {
    return <ActivityIndicator size="small" />;
  }

  return <Thumbnail src={url} size={size} />;
};

export const ThumbnailLoader = memo(ThumbnailLoaderComponent);
ThumbnailLoader.displayName = "ThumbnailLoader";
