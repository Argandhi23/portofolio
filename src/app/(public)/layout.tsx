import { SmoothScrollProvider } from '@/components/motion/SmoothScrollProvider';
import { IntroPreloader } from '@/components/motion/IntroPreloader';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <IntroPreloader />
      <div className="min-h-screen bg-[#080808] text-white">{children}</div>
    </SmoothScrollProvider>
  );
}
