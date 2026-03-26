import { memo } from "react";
import Link from "next/link";
import { Plus, Radio, FileText, MessageSquare } from "lucide-react";

export const QuickActions = memo(({ isFactory, t }: { isFactory: boolean; t: any }) => (
  <div className="gulf-card p-8">
    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
      <div className="w-2 h-6 bg-amber-500 rounded-full" />
      {t("dashboard.quick_actions")}
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {isFactory ? (
        <>
          <Link
            href="/dashboard/products/new"
            className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-3xl hover:bg-emerald-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-emerald-900/20"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
              <Plus className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              {t("dashboard.action.new_product")}
            </span>
          </Link>
          <Link
            href="/dashboard/live"
            className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-3xl hover:bg-rose-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-rose-900/20"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
              <Radio className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              {t("dashboard.action.live_stream")}
            </span>
          </Link>
          <Link
            href="/dashboard/rfqs"
            className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-3xl hover:bg-blue-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-blue-900/20"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
              <FileText className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              {t("dashboard.action.view_rfqs")}
            </span>
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/dashboard/rfq/new"
            className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-3xl hover:bg-emerald-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-emerald-900/20"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
              <Plus className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              {t("nav.rfq")}
            </span>
          </Link>
          <Link
            href="/dashboard/messages"
            className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-3xl hover:bg-blue-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-blue-900/20"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
              <MessageSquare className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              {t("nav.messages")}
            </span>
          </Link>
        </>
      )}
    </div>
  </div>
));
QuickActions.displayName = "QuickActions";
