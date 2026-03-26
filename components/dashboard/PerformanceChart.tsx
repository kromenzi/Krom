import { memo } from "react";

export const PerformanceChart = memo(({ t }: { t: any }) => (
  <div className="lg:col-span-2 gulf-card p-8">
    <div className="flex items-center justify-between mb-10">
      <div>
        <h3 className="text-xl font-black text-slate-900">
          {t("dashboard.performance")}
        </h3>
        <p className="text-sm font-medium text-slate-400">
          {t("dashboard.performance_desc")}
        </p>
      </div>
      <select className="bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold px-4 py-2.5 text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
        <option>{t("dashboard.last_7_days")}</option>
        <option>{t("dashboard.last_30_days")}</option>
        <option>{t("dashboard.last_12_months")}</option>
      </select>
    </div>
    <div className="h-[300px] flex items-end justify-between gap-3">
      {[40, 70, 45, 90, 65, 85, 55, 75, 50, 80, 60, 95].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
          <div
            className="w-full bg-emerald-50 rounded-t-xl group-hover:bg-emerald-600 transition-all duration-500 cursor-pointer relative shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-900/10"
            style={{ height: `${h}%` }}
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
              {h * 10} {t("dashboard.views")}
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            M{i + 1}
          </span>
        </div>
      ))}
    </div>
  </div>
));
PerformanceChart.displayName = "PerformanceChart";
