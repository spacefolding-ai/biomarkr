import React from 'react';
import {
  Home,
  List,
  UploadCloud,
  FlaskConical,
  Settings,
  FileText,
} from 'lucide-react-native';

type IconName = 'overview' | 'parameters' | 'upload' | 'lab' | 'settings' | 'file';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function AppIcon({ name, size = 24, color = 'black' }: IconProps) {
  switch (name) {
    case 'overview':
      return <Home size={size} color={color} />;
    case 'parameters':
      return <List size={size} color={color} />;
    case 'upload':
      return <UploadCloud size={size} color={color} />;
    case 'lab':
      return <FlaskConical size={size} color={color} />;
    case 'settings':
      return <Settings size={size} color={color} />;
    case 'file':
      return <FileText size={size} color={color} />;
    default:
      return <Home size={size} color={color} />;
  }
}