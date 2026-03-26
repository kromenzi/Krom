import { memo } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const StatsGrid = memo(({ statsConfig }: { statsConfig: any[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {statsConfig.map((stat, i) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="gulf-card p-6 hover:shadow-xl hover:shadow-slate-200/60 group"
      >
        <div className="flex items-start justify-between">
          <div
            className={`p-4 rounded-2xl ${stat.bg} text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}
          >
            <stat.icon className="w-6 h-6" />
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
              stat.trend === "up"
                ? "bg-emerald-50 text-emerald-600"
                : stat.trend === "down"
                ? "bg-rose-50 text-rose-600"
                : "bg-slate-50 text-slate-600"
            }`}
          >
            {stat.trend === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : stat.trend === "down" ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : null}
            {stat.change}
          </div>
        </div>
        <div className="mt-5">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            {stat.label}
          </p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">
            {stat.value}
          </h3>
        </div>
      </motion.div>
    ))}
  </div>
));
StatsGrid.displayName = "StatsGrid";
