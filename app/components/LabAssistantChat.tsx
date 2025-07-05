import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { LabAssistantLoading } from "./LabAssistantLoading";

interface LabAssistantChatProps {
  chatHTML: string;
  onChatReady: () => void;
  onChatError: (error: string) => void;
}

export const LabAssistantChat: React.FC<LabAssistantChatProps> = ({
  chatHTML,
  onChatReady,
  onChatError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [webViewError, setWebViewError] = useState<string | null>(null);

  const handleLoadStart = () => {
    setIsLoading(true);
    setWebViewError(null);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    const errorMessage = `Failed to load chat: ${
      nativeEvent.description || "Unknown error"
    }`;
    setWebViewError(errorMessage);
    setIsLoading(false);
    onChatError(errorMessage);
  };

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case "CHAT_READY":
          setIsLoading(false);
          onChatReady();
          break;
        case "CHAT_ERROR":
          setWebViewError(message.error);
          setIsLoading(false);
          onChatError(message.error);
          break;
      }
    } catch (e) {
      // Ignore message parsing errors
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <LabAssistantLoading message="Loading Lab Assistant..." />}

      <WebView
        source={{ html: chatHTML }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        originWhitelist={["*"]}
        allowsFullscreenVideo={false}
        bounces={false}
        scrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  webview: {
    flex: 1,
  },
});
