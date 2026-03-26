"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FileText,
  Package,
  MessageSquare,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  Radio,
  LayoutDashboard,
  Sparkles,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import dynamic from "next/dynamic";

// --- Dynamic Imports for Performance ---

const StatsGrid = dynamic(() => import("@/components/dashboard/StatsGrid").then(m => m.StatsGrid), {
  loading: () => <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100" />)}
  </div>,
  ssr: false
});

const QuickActions = dynamic(() => import("@/components/dashboard/QuickActions").then(m => m.QuickActions), {
  loading: () => <div className="h-48 bg-white rounded-3xl border border-slate-100 animate-pulse" />,
  ssr: false
});

const RecentActivityList = dynamic(() => import("@/components/dashboard/RecentActivityList").then(m => m.RecentActivityList), {
  loading: () => <div className="h-96 bg-white rounded-3xl border border-slate-100 animate-pulse" />,
  ssr: false
});

const PerformanceChart = dynamic(() => import("@/components/dashboard/PerformanceChart").then(m => m.PerformanceChart), {
  loading: () => <div className="lg:col-span-2 h-96 bg-white rounded-3xl border border-slate-100 animate-pulse" />,
  ssr: false
});

const AIInsightsCard = dynamic(() => import("@/components/dashboard/AIInsightsCard").then(m => m.AIInsightsCard), {
  loading: () => <div className="h-64 bg-slate-900 rounded-[2.5rem] animate-pulse" />,
  ssr: false
});

// --- Main Component ---

export default function DashboardOverview() {
  const { profile, user } = useAuth();
  const { t, dir } = useLanguage();
  const [stats, setStats] = useState({
    rfqs: 0,
    products: 0,
    unreadMessages: 0,
    profileViews: 1240,
  });

  const recentActivity = useMemo(() => [
    {
      id: 1,
      type: "rfq",
      title: t("activity.new_rfq"),
      description: t("activity.new_rfq_desc"),
      timestamp: new Date("2026-03-24T21:00:00Z"),
      status: "pending",
    },
    {
      id: 2,
      type: "message",
      title: t("activity.new_message"),
      description: t("activity.new_message_desc"),
      timestamp: new Date("2026-03-24T20:00:00Z"),
      status: "unread",
    },
    {
      id: 3,
      type: "order",
      title: t("activity.order_completed"),
      description: t("activity.order_completed_desc"),
      timestamp: new Date("2026-03-23T21:00:00Z"),
      status: "completed",
    },
  ], [t]);

  useEffect(() => {
    if (!user || !profile) return;

    const isFactory = profile.role === "factory" || profile.role === "admin";
    
    // Critical listener: RFQs
    const rfqQuery = isFactory
      ? query(
          collection(db, "rfqs"),
          where("status", "in", ["pending", "quoted", "accepted"])
        )
      : query(collection(db, "rfqs"), where("buyerId", "==", user.uid));

    const unsubRfqs = onSnapshot(rfqQuery, (snap) =>
      setStats((prev) => ({ ...prev, rfqs: snap.size }))
    );

    // Defer non-critical listeners to improve initial hydration and TTI
    let unsubProducts: (() => void) | undefined;
    let unsubChats: (() => void) | undefined;

    const deferTimer = setTimeout(() => {
      if (isFactory) {
        const productQuery = query(
          collection(db, "products"),
          where("factoryId", "==", user.uid)
        );
        unsubProducts = onSnapshot(productQuery, (snap) =>
          setStats((prev) => ({ ...prev, products: snap.size }))
        );
      }

      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
      );
      unsubChats = onSnapshot(chatsQuery, (snapshot) => {
        let unreadTotal = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.unreadCount && data.unreadCount[user.uid]) {
            unreadTotal += data.unreadCount[user.uid];
          }
        });
        setStats((prev) => ({ ...prev, unreadMessages: unreadTotal }));
      });
    }, 1000); // 1s delay for non-critical data

    return () => {
      unsubRfqs();
      if (unsubProducts) unsubProducts();
      if (unsubChats) unsubChats();
      clearTimeout(deferTimer);
    };
  }, [user, profile]);

  const isFactory = profile?.role === "factory" || profile?.role === "admin";

  const statsConfig = useMemo(() => {
    if (isFactory) {
      return [
        {
          label: t("dashboard.stats.total_products"),
          value: stats.products,
          change: "+12%",
          trend: "up",
          icon: Package,
          color: "emerald",
          bg: "bg-emerald-50",
        },
        {
          label: t("dashboard.stats.total_quotes"),
          value: stats.rfqs,
          change: "+8%",
          trend: "up",
          icon: FileText,
          color: "blue",
          bg: "bg-blue-50",
        },
        {
          label: t("dashboard.stats.profile_views"),
          value: stats.profileViews.toLocaleString(),
          change: "+18%",
          trend: "up",
          icon: Eye,
          color: "purple",
          bg: "bg-purple-50",
        },
        {
          label: t("dashboard.stats.unread_messages"),
          value: stats.unreadMessages,
          change: stats.unreadMessages > 0 ? "New" : "0",
          trend: stats.unreadMessages > 0 ? "up" : "neutral",
          icon: MessageSquare,
          color: "amber",
          bg: "bg-amber-50",
        },
      ];
    }
    return [
      {
        label: t("dashboard.stats.active_rfqs"),
        value: stats.rfqs,
        change: "+2",
        trend: "up",
        icon: FileText,
        color: "emerald",
        bg: "bg-emerald-50",
      },
      {
        label: t("dashboard.stats.total_orders"),
        value: "42",
        change: "+5%",
        trend: "up",
        icon: Package,
        color: "blue",
        bg: "bg-blue-50",
      },
      {
        label: t("dashboard.stats.saved_factories"),
        value: "12",
        change: "0",
        trend: "neutral",
        icon: Users,
        color: "purple",
        bg: "bg-purple-50",
      },
      {
        label: t("dashboard.stats.unread_messages"),
        value: stats.unreadMessages,
        change: stats.unreadMessages > 0 ? "New" : "0",
        trend: stats.unreadMessages > 0 ? "up" : "neutral",
        icon: MessageSquare,
        color: "amber",
        bg: "bg-amber-50",
      },
    ];
  }, [isFactory, stats, t]);

  if (!profile) return null;

  return (
    <div className="space-y-8 pb-12" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t("dashboard.welcome")},{" "}
            {profile?.companyName || profile?.displayName?.split(" ")?.[0] || "User"}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {isFactory ? t("dashboard.factory") : t("dashboard.buyer")} •{" "}
            {new Date().toLocaleDateString(dir === "rtl" ? "ar-SA" : "en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/live"
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full font-medium hover:bg-rose-100 transition-colors border border-rose-100"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            {t("nav.live")}
          </Link>
          <Link
            href={isFactory ? "/dashboard/products/new" : "/dashboard/rfq/new"}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <Plus className="w-4 h-4" />
            {isFactory ? t("products.add") : t("nav.rfq")}
          </Link>
        </div>
      </div>

      <StatsGrid statsConfig={statsConfig} />
      <QuickActions isFactory={isFactory} t={t} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PerformanceChart t={t} />
        <RecentActivityList recentActivity={recentActivity} t={t} />
      </div>

      <AIInsightsCard t={t} />
    </div>
  );
}
