import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground overflow-hidden">
      {/* Background ambient light effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50 mix-blend-screen transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] opacity-50 mix-blend-screen transform -translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
