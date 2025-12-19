import { Gem, Globe, MapPin, Sparkles, Zap } from "lucide-react";

const logos = [
  { name: "Dreamure", icon: Gem },
  { name: "SWITCH.WIN", icon: Zap },
  { name: "sphere", icon: Globe },
  { name: "PinSpace", icon: MapPin },
  { name: "Visionix", icon: Sparkles },
];

export const FooterLogos = () => {
  return (
    <div className="w-full py-8 md:py-10 mt-auto z-20">
      <div className="flex flex-wrap justify-between items-center gap-8 md:gap-12 px-8 lg:px-20 max-w-[1440px] mx-auto">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex items-center gap-3 group cursor-pointer transition-all duration-500 hover:opacity-100 opacity-40"
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-300">
              <logo.icon className="h-5 w-5 text-purple-200 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
            </span>
            <span className="font-semibold text-lg tracking-wide text-white/80 group-hover:text-white transition-colors font-sans">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
