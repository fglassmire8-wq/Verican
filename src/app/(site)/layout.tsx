import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackPageView } from "@/components/TrackPageView";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TrackPageView />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
