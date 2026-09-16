import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/layout/BackToTop";
import { getResolvedSettings } from "@/lib/settings";
import { getCategories } from "@/lib/supabase/queries";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Categories come from the database so the header and footer can never link
  // to one that does not exist (the header used to offer /blog/category/
  // mindfulness, a 404, from every page) or silently omit one.
  const [settings, categories] = await Promise.all([
    getResolvedSettings(),
    getCategories(),
  ]);

  const navCategories = categories.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        siteName={settings.siteName}
        logoUrl={settings.logoUrl}
        categories={navCategories}
      />
      <main className="flex-1 pt-20">{children}</main>
      <Footer siteName={settings.siteName} categories={navCategories} />
      <BackToTop />
    </div>
  );
}
