import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { Typography } from '../theme/typography';

interface CustomTextProps extends TextProps {
  variant?: keyof typeof Typography;
  style?: TextStyle;
  children: React.ReactNode;
}

export default function CustomText({
  variant = 'body',
  style,
  children,
  ...props
}: CustomTextProps) {
  return (
    <Text style={[Typography[variant], style]} {...props}>
      {children}
    </Text>
  );
}