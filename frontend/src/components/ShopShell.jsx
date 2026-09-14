import ShopNav from "./ShopNav";
import MobileTabBar from "./MobileTabBar";
import Footer from "../sections/Footer";

export default function ShopShell({ children, wide = false }) {
  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#121212]">
      <ShopNav />
      <main className={`mx-auto ${wide ? "max-w-[1600px]" : "max-w-6xl"} px-5 pb-28 pt-24 md:px-10 md:pt-28`}>
        {children}
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
