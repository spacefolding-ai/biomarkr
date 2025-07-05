import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

// Components
import { LabAssistantChat } from "../components/LabAssistantChat";
import { LabAssistantError } from "../components/LabAssistantError";

// Hooks and utilities
import { generateN8nChatHTML } from "../utils/n8nChatTemplate";

const LabAssistantScreen = () => {
  const webhookUrl = process.env.EXPO_PUBLIC_N8N_CHAT_URL!;
  const [chatError, setChatError] = useState<string | null>(null);

  const chatHTML = generateN8nChatHTML({ webhookUrl });

  const handleRetry = () => {
    setChatError(null);
  };

  const handleChatReady = () => {
    // Chat is ready, nothing special to do
  };

  const handleChatError = (error: string) => {
    setChatError(error);
  };

  // Show error if there's a chat error
  if (chatError) {
    return <LabAssistantError error={chatError} onRetry={handleRetry} />;
  }

  // Show chat interface
  return (
    <View style={styles.container}>
      <LabAssistantChat
        chatHTML={chatHTML}
        onChatReady={handleChatReady}
        onChatError={handleChatError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});

export default LabAssistantScreen;
