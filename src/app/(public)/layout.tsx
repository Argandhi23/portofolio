import { SmoothScrollProvider } from '@/components/motion/SmoothScrollProvider';
import { IntroPreloader } from '@/components/motion/IntroPreloader';
import { ChatWidget } from '@/components/public/ChatWidget';
import { VisitorTracker } from '@/components/public/VisitorTracker';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <IntroPreloader />
      <VisitorTracker />
      <div className="min-h-screen bg-[#080808] text-white">{children}</div>
      <ChatWidget />
    </SmoothScrollProvider>
  );
}
