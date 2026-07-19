import { useEffect } from 'react';

export default function SupportWidget() {
  useEffect(() => {
    const existing = document.querySelector('script[src*="convai-widget-embed"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <elevenlabs-convai agent-id="agent_3201kxqqfsx8ey7ry1y6wdze5qww"></elevenlabs-convai>
  );
}