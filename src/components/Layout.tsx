import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import ScrollToTop from "./ScrollToTop";
import { usePageTracking } from "@/hooks/usePageTracking";
import NewsletterModal from "./NewsletterModal";
import InstallPrompt from "./InstallPrompt";

export default function Layout() {
  usePageTracking();

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <TopBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <NewsletterModal />
      <InstallPrompt />
    </div>
  );
}
