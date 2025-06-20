import {
  BookHeart,
  Ellipsis,
  FileText,
  FlaskConical,
  Home,
  UploadCloud,
} from "lucide-react-native";
import React from "react";

export type IconName =
  | "overview"
  | "health-lab"
  | "upload"
  | "lab-assistant"
  | "file"
  | "more";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function AppIcon({ name, size = 24, color = "black" }: IconProps) {
  switch (name) {
    case "overview":
      return <Home size={size} color={color} />;
    case "health-lab":
      return <BookHeart size={size} color={color} />;
    case "upload":
      return <UploadCloud size={size} color={color} />;
    case "lab-assistant":
      return <FlaskConical size={size} color={color} />;
    case "file":
      return <FileText size={size} color={color} />;
    case "more":
      return <Ellipsis size={size} color={color} />;
    default:
      return <Home size={size} color={color} />;
  }
}
