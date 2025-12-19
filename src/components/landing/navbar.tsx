import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-sm">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo placeholder - using text for now as per design style */}
          <div className="bg-white text-black font-black h-8 w-8 flex items-center justify-center rounded-md text-xl">
            M
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Meetly</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-white/70 text-sm font-medium">
          <Link href="#team" className="hover:text-white transition-colors">
            Your Team
          </Link>
          <Link href="#solutions" className="hover:text-white transition-colors">
            Solutions
          </Link>
          <Link href="#blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <Link href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Link
          href="/login"
          className="text-white text-sm font-medium hover:text-white/80 transition-colors"
        >
          Log In
        </Link>
        <Link
          href="/register"
          className="bg-[#0F0A2A] hover:bg-[#1a1040] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all border border-purple-500/30 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
        >
          Join Now
        </Link>
      </div>
    </nav>
  );
};
