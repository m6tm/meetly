import { ChevronRight, Play } from "lucide-react";
import { FooterLogos } from "./footer-logos";
import { Navbar } from "./navbar";
import { OrbitingCircles } from "./orbiting-circles";

export const LandingPage = () => {
  return (
    <main className="relative h-screen w-full bg-[#0F0A2A] overflow-hidden text-white selection:bg-purple-500/30 flex flex-col">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Warm top-left glow */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#FFBE7B]/20 blur-[150px] rounded-full mix-blend-screen animate-pulse"
          style={{ animationDuration: "5s" }}
        />
        {/* Cool bottom-right glow */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full mix-blend-screen" />
        {/* Central/Right subtle purple glow */}
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />

        {/* Grain Overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-50">
        <Navbar />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center min-h-0">
        <div className="flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20 max-w-[1440px] mx-auto w-full gap-4 lg:gap-8">
          {/* Left Content */}
          <div className="flex-1 flex flex-col gap-5 items-start max-w-2xl z-20">
            <h1 className="text-4xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Unlock Top <br />
              Marketing Talent <br />
              You Thought Was <br />
              Out of Reach –
            </h1>
            <p className="text-xl lg:text-2xl text-purple-200/80 font-medium mb-8 leading-snug">
              Now Just One <br />
              Click Away!
            </p>

            <div className="relative group mt-2">
              <button
                type="button"
                className="bg-black text-white border border-white/10 pl-8 pr-16 py-4 rounded-full text-lg font-medium hover:bg-zinc-900 transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-95"
              >
                Start Project
              </button>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              {/* Floating Label from Design */}
              <div
                className="absolute -bottom-8 right-[-50px] bg-[#8B5CF6] backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold animate-bounce shadow-xl z-30 flex items-center gap-2"
                style={{ animationDuration: "3s" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                David
              </div>
              <div className="absolute -bottom-8 right-[-30px] text-[#8B5CF6] rotate-30 z-20">
                <Play className="w-4 h-4 fill-current" />
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="flex-1 flex items-center justify-center lg:justify-end scale-[0.65] lg:scale-[0.85] xl:scale-100 origin-center lg:origin-right mt-10 lg:mt-0">
            <OrbitingCircles />
          </div>
        </div>
      </div>

      <div className="relative z-10 shrink-0">
        <FooterLogos />
      </div>
    </main>
  );
};
