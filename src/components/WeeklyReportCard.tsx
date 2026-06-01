"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface WeeklyScan {
  health_score: number;
  scanned_at: string;
}

interface WeeklyReportCardProps {
  weeklyScans: WeeklyScan[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeeklyReportCard({ weeklyScans }: WeeklyReportCardProps) {
  const report = useMemo(() => {
    if (!weeklyScans || weeklyScans.length === 0) {
      return null;
    }

    const dayMap = new Map<number, { scores: number[]; label: string }>();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayOfWeek = d.getDay();
      dayMap.set(dayOfWeek, { scores: [], label: DAY_LABELS[dayOfWeek] });
    }

    weeklyScans.forEach((scan) => {
      const date = new Date(scan.scanned_at);
      const dayOfWeek = date.getDay();
      const entry = dayMap.get(dayOfWeek);
      if (entry) {
        entry.scores.push(scan.health_score);
      }
    });

    const chartData = Array.from(dayMap.values()).map((entry) => ({
      label: entry.label,
      avgScore: entry.scores.length > 0
        ? Math.round(entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length)
        : 0,
      count: entry.scores.length,
    }));

    const totalScans = weeklyScans.length;
    const avgScore = Math.round(
      weeklyScans.reduce((sum, s) => sum + s.health_score, 0) / totalScans
    );

    const bestDay = chartData.reduce(
      (best, day) => (day.avgScore > best.avgScore ? day : best),
      chartData[0]
    );

    const midPoint = Math.floor(weeklyScans.length / 2);
    const firstHalf = weeklyScans.slice(0, midPoint);
    const secondHalf = weeklyScans.slice(midPoint);

    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((s, sc) => s + sc.health_score, 0) / firstHalf.length
      : 0;
    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((s, sc) => s + sc.health_score, 0) / secondHalf.length
      : 0;

    let trend: "improving" | "declining" | "stable" = "stable";
    if (secondHalfAvg - firstHalfAvg > 5) trend = "improving";
    else if (firstHalfAvg - secondHalfAvg > 5) trend = "declining";

    return {
      chartData,
      totalScans,
      avgScore,
      bestDay: bestDay.label,
      bestDayScore: bestDay.avgScore,
      trend,
    };
  }, [weeklyScans]);

  if (!report) {
    return (
      <section className="glass-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/8">
            <BarChart3 className="h-4 w-4 text-primary-400" />
          </div>
          <h3 className="text-sm font-semibold text-dark-300">Weekly Health Report</h3>
        </div>
        <div className="flex flex-col items-center py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.03] mb-3">
            <BarChart3 className="h-7 w-7 text-dark-600" />
          </div>
          <p className="text-dark-500 text-sm">
            Start scanning to see your weekly report!
          </p>
        </div>
      </section>
    );
  }

  const maxScore = Math.max(...report.chartData.map((d) => d.avgScore), 1);

  return (
    <section className="glass-card p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/8">
            <BarChart3 className="h-4 w-4 text-primary-400" />
          </div>
          <h3 className="text-sm font-semibold text-dark-300">Weekly Health Report</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {report.trend === "improving" && (
            <TrendingUp className="h-4 w-4 text-primary-400" />
          )}
          {report.trend === "declining" && (
            <TrendingDown className="h-4 w-4 text-danger-400" />
          )}
          {report.trend === "stable" && (
            <Minus className="h-4 w-4 text-accent-400" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              report.trend === "improving" && "text-primary-400",
              report.trend === "declining" && "text-danger-400",
              report.trend === "stable" && "text-accent-400"
            )}
          >
            {report.trend === "improving" && "Improving"}
            {report.trend === "declining" && "Declining"}
            {report.trend === "stable" && "Stable"}
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-2 h-28 mb-3">
        {report.chartData.map((day, i) => {
          const height = day.count > 0
            ? Math.max((day.avgScore / maxScore) * 100, 8)
            : 4;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative" style={{ height: "100px" }}>
                <div
                  className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 w-5 rounded-t-md transition-all duration-500",
                    day.count > 0
                      ? "bg-gradient-to-t from-primary-500 to-primary-400"
                      : "bg-white/[0.04]"
                  )}
                  style={{ height: `${height}px` }}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  day.count > 0 ? "text-dark-400" : "text-dark-600"
                )}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.04]">
        <div className="text-center">
          <p className="text-lg font-bold text-dark-50">{report.totalScans}</p>
          <p className="text-[10px] text-dark-500">Total Scans</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-primary-400">{report.avgScore}</p>
          <p className="text-[10px] text-dark-500">Avg Score</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-dark-50">{report.bestDay}</p>
          <p className="text-[10px] text-dark-500">Best Day</p>
        </div>
      </div>
    </section>
  );
}
