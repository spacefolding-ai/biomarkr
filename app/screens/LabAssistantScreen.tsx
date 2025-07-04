import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

const LabAssistantScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<
    "checking" | "active" | "inactive"
  >("checking");

  const n8nWebhookUrl =
    process.env.EXPO_PUBLIC_N8N_CHAT_URL ||
    "https://n8n.srv787344.hstgr.cloud/webhook/f3f32cba-b85b-45d6-b7b4-372cfaee05f3/chat";

  // Simplified webhook status check
  useEffect(() => {
    const checkWebhookStatus = async () => {
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chatInput: "test connection" }),
        });

        // Accept any response as working - let the chat widget handle errors
        setWebhookStatus("active");
      } catch (error) {
        // Even if check fails, try to load the chat widget
        setWebhookStatus("active");
      }
    };

    // Faster timeout for better UX
    setTimeout(checkWebhookStatus, 500);
  }, [n8nWebhookUrl]);

  // n8n chat widget HTML
  const chatHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lab Assistant Chat</title>
        <link href="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css" rel="stylesheet" />
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #f5f5f5;
                min-height: 100vh;
            }
            #n8n-chat {
                width: 100%;
                height: 100vh;
            }
            /* Customize chat appearance */
            :root {
                --chat--color-primary: #007AFF;
                --chat--color-secondary: #34C759;
                --chat--window--width: 100%;
                --chat--window--height: 100%;
            }
            /* Simple branding hiding */
            [data-key="poweredBy"] {
                display: none !important;
            }
            /* Hide specific branding classes only */
            .powered-by {
                display: none !important;
            }
        </style>
    </head>
    <body>
        <div id="loading" style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 18px; color: #666;">
            Loading Lab Assistant...
        </div>
        <div id="n8n-chat"></div>
        
        <script type="module">
            import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
            
            function initializeChat() {
                try {
                    // Hide loading indicator
                    const loadingElement = document.getElementById('loading');
                    if (loadingElement) {
                        loadingElement.style.display = 'none';
                    }
                    
                    const chatConfig = {
                        webhookUrl: '${n8nWebhookUrl}',
                        target: '#n8n-chat',
                        mode: 'fullscreen',
                        showWelcomeScreen: false,
                        defaultLanguage: 'en',
                        chatInputKey: 'chatInput',
                        chatSessionKey: 'sessionId',
                        loadPreviousSession: false,
                        webhookConfig: {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        },
                        initialMessages: [
                            'Hi there! 👋',
                            'I\\'m your Lab Assistant. How can I help you today?'
                        ],
                        i18n: {
                            en: {
                                title: 'Lab Assistant',
                                subtitle: 'Ask me anything about your lab results.',
                                getStarted: 'Start Chat',
                                inputPlaceholder: 'Type your question...',
                            },
                        },
                    };
                    
                    const chat = createChat(chatConfig);
                    
                    // Simple, targeted branding removal that won't interfere with chat
                    const removeBranding = () => {
                        // Only target very specific branding elements
                        const brandingSelectors = [
                            '[data-key="poweredBy"]',
                            '.powered-by'
                        ];
                        
                        brandingSelectors.forEach(selector => {
                            const elements = document.querySelectorAll(selector);
                            elements.forEach(element => {
                                if (element) {
                                    element.style.display = 'none';
                                }
                            });
                        });
                        
                        // Only look for very specific branding text, not general "powered by"
                        const allDivs = document.querySelectorAll('div');
                        allDivs.forEach(div => {
                            if (div.textContent && 
                                div.textContent.trim().toLowerCase() === 'powered by n8n' &&
                                div.children.length === 0) { // Only remove if it's a leaf element
                                div.style.display = 'none';
                            }
                        });
                    };
                    
                    // Run branding removal less aggressively
                    setTimeout(removeBranding, 2000);
                    setTimeout(removeBranding, 4000);
                    
                    // Notify React Native immediately
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'CHAT_READY'
                        }));
                    }
                    
                } catch (error) {
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'CHAT_ERROR',
                            error: error.message
                        }));
                    }
                }
            }
            
            // Initialize immediately
            initializeChat();
        </script>
    </body>
    </html>
  `;

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setError(
      `Failed to load chat: ${nativeEvent.description || "Unknown error"}`
    );
    setIsLoading(false);
  };

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case "CHAT_READY":
          setIsLoading(false);
          setWebhookStatus("active");
          break;
        case "CHAT_ERROR":
          setError(message.error);
          setIsLoading(false);
          break;
      }
    } catch (e) {
      // Ignore message parsing errors
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Lab Assistant Unavailable</Text>
        <Text style={styles.errorMessage}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
            setWebhookStatus("checking");
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>

        <View style={styles.troubleshootContainer}>
          <Text style={styles.troubleshootTitle}>To Fix This Issue:</Text>
          <Text style={styles.troubleshootStep}>
            1. Go to your n8n dashboard
          </Text>
          <Text style={styles.troubleshootStep}>
            2. Find the Lab Assistant workflow
          </Text>
          <Text style={styles.troubleshootStep}>
            3. Click the toggle switch to activate it
          </Text>
          <Text style={styles.troubleshootStep}>
            4. Ensure the workflow is "Active"
          </Text>
          <Text style={styles.troubleshootStep}>
            5. Return here and tap "Retry"
          </Text>
        </View>
      </View>
    );
  }

  if (webhookStatus === "checking") {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Checking Lab Assistant status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Lab Assistant...</Text>
        </View>
      )}

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
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 1,
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  troubleshootContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  troubleshootTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  troubleshootStep: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
});

export default LabAssistantScreen;
