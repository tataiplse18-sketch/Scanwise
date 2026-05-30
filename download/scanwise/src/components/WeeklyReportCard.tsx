"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3 } from "lucide-react";

interface DayData {
  day: string;
  score: number;
}

export default function WeeklyReportCard() {
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeeklyData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const { data } = await supabase
          .from("scan_results")
          .select("health_score, scanned_at")
          .eq("user_id", user.id)
          .gte("scanned_at", sevenDaysAgo.toISOString())
          .order("scanned_at", { ascending: true });

        if (data && data.length > 0) {
          // Group by day
          const dayMap = new Map<string, number[]>();
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

          // Initialize last 7 days
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split("T")[0];
            const dayName = dayNames[d.getDay()];
            dayMap.set(key, []);
          }

          // Fill in scores
          data.forEach((scan) => {
            const key = scan.scanned_at.split("T")[0];
            if (dayMap.has(key)) {
              dayMap.get(key)!.push(scan.health_score);
            }
          });

          const result: DayData[] = [];
          let totalScore = 0;
          let totalDays = 0;

          dayMap.forEach((scores, key) => {
            const d = new Date(key);
            const dayName = dayNames[d.getDay()];
            const avg = scores.length > 0
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              : 0;
            result.push({ day: dayName, score: avg });
            if (scores.length > 0) {
              totalScore += avg;
              totalDays++;
            }
          });

          setWeekData(result);
          setAvgScore(totalDays > 0 ? Math.round(totalScore / totalDays) : 0);
        } else {
          // No data - show empty days
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const empty: DayData[] = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            empty.push({ day: dayNames[d.getDay()], score: 0 });
          }
          setWeekData(empty);
        }
      } catch {
        // Graceful fallback
      } finally {
        setLoading(false);
      }
    }

    fetchWeeklyData();
  }, []);

  const maxScore = 100;

  function getBarColor(score: number): string {
    if (score >= 80) return "bg-primary-500";
    if (score >= 60) return "bg-primary-400";
    if (score >= 30) return "bg-accent-500";
    return "bg-danger-500";
  }

  if (loading) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-5 w-32 rounded bg-dark-700 mb-4" />
        <div className="flex items-end justify-between gap-2 h-28">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 rounded-t bg-dark-700 h-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary-400" />
          <h3 className="text-sm font-semibold text-dark-50">Weekly Report</h3>
        </div>
        {avgScore > 0 && (
          <span className="text-xs text-dark-400">
            Avg: <span className="text-primary-400 font-medium">{avgScore}</span>
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2 h-28">
        {weekData.map((day, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="relative w-full flex justify-center" style={{ height: "80px" }}>
              <div
                className={`w-full max-w-[24px] rounded-t transition-all duration-700 ${
                  day.score > 0 ? getBarColor(day.score) : "bg-dark-700/50"
                }`}
                style={{
                  height: day.score > 0 ? `${(day.score / maxScore) * 100}%` : "8px",
                  minHeight: "4px",
                }}
              />
            </div>
            <span className="text-[9px] text-dark-500 font-medium">{day.day}</span>
          </div>
        ))}
      </div>

      {weekData.every((d) => d.score === 0) && (
        <p className="mt-3 text-center text-xs text-dark-500">
          Scan products to see your weekly report
        </p>
      )}
    </div>
  );
}
