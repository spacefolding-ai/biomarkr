interface ChatTemplateProps {
  webhookUrl: string;
}

export const generateN8nChatHTML = ({
  webhookUrl,
}: ChatTemplateProps): string => {
  return `
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
                        webhookUrl: '${webhookUrl}',
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
};
