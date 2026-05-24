import { Outlet } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { SearchModal } from "./SearchModal";
import { WhatsAppFloat } from "./WhatsAppFloat";

export function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 md:pt-28">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal />
      <WhatsAppFloat />
    </div>
  );
}