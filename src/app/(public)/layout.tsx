import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/layout/BackToTop";
import { getResolvedSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getResolvedSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar siteName={settings.siteName} logoUrl={settings.logoUrl} />
      <main className="flex-1 pt-20">{children}</main>
      <Footer siteName={settings.siteName} />
      <BackToTop />
    </div>
  );
}
