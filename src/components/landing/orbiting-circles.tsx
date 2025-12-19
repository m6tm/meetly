import { Bot, Zap } from "lucide-react";
import { cn } from "@/shared/infrastructure/utils";

interface OrbitingCirclesProps {
  className?: string;
}

export const OrbitingCircles = ({ className }: OrbitingCirclesProps) => {
  return (
    <div className={cn("relative flex items-center justify-center w-[600px] h-[600px]", className)}>
      {/* Central Content */}
      <div className="absolute z-10 flex flex-col items-center justify-center text-white">
        <span className="text-5xl font-bold tracking-tighter">20k+</span>
        <span className="text-sm text-white/60 mt-1 uppercase tracking-widest text-[10px]">
          Specialists
        </span>
      </div>

      {/* Orbit 1 (Inner) */}
      <div className="absolute border border-white/5 rounded-full w-[280px] h-[280px]" />
      <div className="absolute w-[280px] h-[280px] animate-orbit-slow">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-indigo-500/90 border border-white/20 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center overflow-hidden">
          {/* Icon Placeholder */}
          <div className="w-6 h-6 bg-indigo-300 rounded-sm opacity-50" />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
          {/* Avatar Placeholder */}
          <div className="w-full h-full bg-linear-to-br from-pink-400 to-rose-500" />
        </div>
      </div>

      {/* Orbit 2 (Middle) */}
      <div className="absolute border border-white/5 rounded-full w-[420px] h-[420px]" />
      <div className="absolute w-[420px] h-[420px] animate-orbit-reverse">
        <div className="absolute top-1/4 left-0 -translate-x-1/2 w-14 h-14 rounded-full border-2 border-white/10 overflow-hidden shadow-lg bg-zinc-900">
          {/* Avatar Placeholder */}
          <div className="w-full h-full bg-linear-to-tr from-amber-200 to-yellow-400" />
        </div>
        <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-12 h-12 rounded-2xl bg-black/80 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {/* Icon Placeholder */}
          <Zap className="w-6 h-6 text-yellow-500 fill-current" />
        </div>
      </div>

      {/* Orbit 3 (Outer) */}
      <div className="absolute border border-white/5 rounded-full w-[560px] h-[560px]" />
      <div className="absolute w-[560px] h-[560px] animate-orbit">
        <div className="absolute top-1/2 right-0 translate-x-1/2 w-16 h-16 rounded-full border-2 border-white/10 overflow-hidden shadow-xl bg-zinc-800">
          {/* Avatar Placeholder */}
          <div className="w-full h-full bg-linear-to-bl from-cyan-400 to-blue-500" />
        </div>
        <div className="absolute bottom-1/4 left-0 -translate-x-1/2 w-14 h-14 rounded-2xl bg-purple-900/80 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.5)]">
          {/* Icon Placeholder */}
          <Bot className="w-8 h-8 text-purple-200" />
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full overflow-hidden border border-white/20">
          {/* Small Avatar Placeholder */}
          <div className="w-full h-full bg-zinc-500" />
        </div>
      </div>
    </div>
  );
};
