import { memo } from "react";
import Link from "next/link";
import { Clock, TrendingUp, MessageSquare, Package } from "lucide-react";

export const RecentActivityList = memo(({ recentActivity, t }: { recentActivity: any[]; t: any }) => (
  <div className="gulf-card p-8">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-xl font-black text-slate-900">
        {t("dashboard.recent_activity")}
      </h3>
      <Link
        href="#"
        className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
      >
        {t("common.view_all")}
      </Link>
    </div>
    <div className="space-y-8">
      {recentActivity.length > 0 ? (
        recentActivity.map((activity) => (
          <div key={activity.id} className="flex gap-5 group cursor-pointer">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 ${
                activity.type === "order"
                  ? "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white"
                  : activity.type === "message"
                  ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                  : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
              }`}
            >
              {activity.type === "order" ? (
                <TrendingUp className="w-6 h-6" />
              ) : activity.type === "message" ? (
                <MessageSquare className="w-6 h-6" />
              ) : (
                <Package className="w-6 h-6" />
              )}
            </div>
            <div className="flex-grow">
              <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {activity.title}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {activity.description}
              </p>
              <span className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                {activity.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-slate-200" />
          </div>
          <p className="text-slate-400 font-bold">
            {t("dashboard.no_activity")}
          </p>
        </div>
      )}
    </div>
  </div>
));
RecentActivityList.displayName = "RecentActivityList";
