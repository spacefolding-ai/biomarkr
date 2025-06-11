import { useState, useEffect } from 'react';

export default function useLoadFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(true);

  // We're using system fonts instead of custom fonts
  // No need to load custom fonts that don't exist
  
  return fontsLoaded;
} 