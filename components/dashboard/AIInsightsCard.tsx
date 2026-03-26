import { memo } from "react";
import { Sparkles, LayoutDashboard } from "lucide-react";

export const AIInsightsCard = memo(({ t }: { t: any }) => (
  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-10 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl shadow-emerald-900/20 border border-emerald-500/10">
    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
      <div className="max-w-xl">
        <div className="flex items-center gap-3 text-amber-400 mb-6">
          <div className="p-2 bg-amber-400/10 rounded-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-sm font-black uppercase tracking-[0.2em]">
            {t("dashboard.ai_insights_subtitle")}
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
          {t("dashboard.ai_insights_title")}
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed font-medium">
          {t("dashboard.ai_insights_description")}
        </p>
        <button className="mt-10 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-2xl transition-all duration-300 shadow-xl shadow-amber-900/40 active:scale-95">
          {t("dashboard.ai_insights_button")}
        </button>
      </div>
      <div className="hidden md:block">
        <div className="w-64 h-64 bg-emerald-500/5 rounded-full border border-emerald-500/10 flex items-center justify-center backdrop-blur-md relative group">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse" />
          <LayoutDashboard className="w-32 h-32 text-emerald-500/20 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>
    </div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
  </div>
));
AIInsightsCard.displayName = "AIInsightsCard";
