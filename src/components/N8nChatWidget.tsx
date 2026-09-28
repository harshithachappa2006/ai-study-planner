import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    n8nChatInitialized?: boolean;
    openN8nChat?: () => void;
  }
}

export const N8N_WEBHOOK_URL = 'https://harshitha2006.app.n8n.cloud/webhook/52ce248d-b5df-432a-95b6-01157025ce0c/chat';
export const N8N_INSTANCE_ID = '4844ad81fcd3696f09c7dc34346539ab44337ed0a00e501811b257656ff8dc71';

export const N8nChatWidget = () => {
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (isLoadedRef.current || window.n8nChatInitialized) return;
    isLoadedRef.current = true;
    window.n8nChatInitialized = true;

    // Helper method to open the chat window programmatically from UI buttons
    window.openN8nChat = () => {
      const toggleBtn = document.querySelector(
        '.chat-toggle, [class*="chat-toggle"], [class*="chat-button"], button[aria-label*="chat" i]'
      ) as HTMLElement | null;
      if (toggleBtn) {
        toggleBtn.click();
      }
    };

    // Inject official n8n chat ES module via script tag
    const script = document.createElement('script');
    script.type = 'module';
    script.id = 'n8n-chat-script';
    script.innerHTML = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      
      createChat({
        webhookUrl: '${N8N_WEBHOOK_URL}',
        webhookConfig: {
          headers: {
            'X-Instance-Id': '${N8N_INSTANCE_ID}',
          },
        },
        mode: 'window',
        showWelcomeScreen: false,
        loadPreviousSession: false,
        initialMessages: [
          'Hi there! 👋',
          'I am Nathan, your AI Study Assistant connected via n8n. Ask me anything about your syllabus, study plan, or exam concepts!',
        ],
        i18n: {
          en: {
            title: 'AI Study Assistant (n8n)',
            subtitle: 'Powered by Nathan • Live Workflow',
            footer: '',
            getStarted: 'Start Chatting',
            inputPlaceholder: 'Type your study question...',
          },
        },
      });
    `;

    document.body.appendChild(script);

    return () => {
      const existing = document.getElementById('n8n-chat-script');
      if (existing) {
        existing.remove();
      }
    };
  }, []);

  return null;
};
