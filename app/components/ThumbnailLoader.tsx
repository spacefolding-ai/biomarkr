import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { getImageUrl } from "../utils/file";
import { Thumbnail } from "./Thumbnail";

interface ThumbnailLoaderProps {
  path: string | null | undefined;
  size?: number;
}

export const ThumbnailLoader: React.FC<ThumbnailLoaderProps> = ({
  path,
  size = 80,
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!path) {
        return;
      }

      try {
        const resolved = await getImageUrl(path);
        if (mounted) {
          setUrl(resolved);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setUrl(null);
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [path]);

  if (loading) {
    return <ActivityIndicator size="small" />;
  }

  return <Thumbnail src={url} size={size} />;
};
