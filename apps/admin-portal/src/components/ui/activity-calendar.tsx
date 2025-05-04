"use client";

// Remove useState import if no longer needed internally
// import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define the expected data structure for the prop
interface ActivityCalendarProps {
  data: { date: string; count: number }[]; // Expecting YYYY-MM-DD string dates
}

export default function ActivityCalendar({ data }: ActivityCalendarProps) {
  // Process the input 'data' to create the structure needed by the calendar
  const processActivityData = (activityData: { date: string; count: number }[]) => {
    const contributionMap = new Map<string, number>();
    activityData.forEach((item) => {
      // Ensure date string is valid before using it
      if (item.date && typeof item.date === "string") {
        contributionMap.set(item.date, item.count);
      } else {
        console.warn("Invalid date format received in ActivityCalendar data:", item);
      }
    });

    const endDate = new Date(); // Today
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1); // One year ago
    startDate.setDate(startDate.getDate() + 1); // Start from the day *after* one year ago

    const calendarData = [];
    // Loop through each day in the last year
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0]; // Get YYYY-MM-DD string
      const count = contributionMap.get(dateStr) || 0; // Get count from map or default to 0
      calendarData.push({
        date: new Date(d), // Store as Date object for internal use
        count,
      });
    }
    return calendarData;
  };

  const contributionData = processActivityData(data); // Use the passed data

  // Get contribution level (0-4) based on count
  const getContributionLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  // Format date for tooltip
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Group contributions by week (GitHub style: weeks start on Sunday)
  const weeks: { date: Date | null; count: number }[][] = [];
  let currentWeek: { date: Date | null; count: number }[] = [];
  let currentDayOfWeek = 0; // Start day index (0 for Sunday)

  if (contributionData.length > 0) {
    const firstDataPointDate = contributionData[0].date;
    const startDayOffset = firstDataPointDate.getDay(); // 0 for Sunday, 1 for Mon, ...

    // Fill initial empty cells for the first week if needed
    for (let i = 0; i < startDayOffset; i++) {
      currentWeek.push({ date: null, count: 0 });
      currentDayOfWeek++;
    }

    // Fill in the contribution data
    contributionData.forEach((day) => {
      currentWeek.push(day);
      currentDayOfWeek++;

      // If the week is full (7 days), push it and start a new one
      if (currentDayOfWeek === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
        currentDayOfWeek = 0;
      }
    });

    // Add the last partial week if it exists
    if (currentWeek.length > 0) {
      // Fill remaining cells in the last week with null
      while (currentWeek.length < 7) {
        currentWeek.push({ date: null, count: 0 });
      }
      weeks.push([...currentWeek]);
    }
  }

  // Calculate dynamic month labels based on the weeks data
  const monthLabels = weeks.reduce(
    (acc, week, weekIndex) => {
      const firstDayOfMonth = week.find((day) => day?.date?.getDate() === 1);
      let labelInfo = { index: -1, label: "" };

      if (firstDayOfMonth?.date) {
        const monthLabel = firstDayOfMonth.date.toLocaleDateString("en-US", { month: "short" });
        // Check if this month label is already added or if it's the first week
        const isNewMonth = !acc.some((l) => l.label === monthLabel);
        if (isNewMonth || weekIndex === 0) {
          labelInfo = { index: weekIndex, label: monthLabel };
        }
      }
      // Add the label info if a new month starts in this week
      if (labelInfo.index !== -1) {
        acc.push(labelInfo);
      }
      return acc;
    },
    [] as { index: number; label: string }[],
  );

  // Day labels (M, W, F)
  const visibleDayLabels = ["", "Mon", "", "Wed", "", "Fri", ""]; // Indices 1, 3, 5

  return (
    <div className="mx-auto w-full max-w-5xl overflow-x-auto p-4 pb-2">
      {" "}
      {/* Added overflow-x-auto */}
      <div className="flex flex-col" style={{ minWidth: "720px" }}>
        {" "}
        {/* Added min-width */}
        {/* Month labels row */}
        <div className="mb-1 grid grid-cols-[auto_1fr] gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-10 flex-shrink-0"></div> {/* Spacer for day labels */}
          <div
            className="relative grid flex-1 grid-flow-col"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(18px, 1fr))` }}
          >
            {" "}
            {/* Adjust min cell width */}
            {monthLabels.map(({ index, label }) => (
              <div
                key={label + index}
                className="absolute text-center"
                // Calculate position: approx middle of the week column(s) for that month
                // This positioning is approximate and might need refinement
                style={{ left: `${(index / weeks.length) * 100}%`, transform: "translateX(-50%)" }}
              >
                {label}
              </div>
            ))}
            {/* Dummy divs to ensure grid structure */}
            {weeks.map((_, weekIndex) => (
              <div key={`month-col-${weekIndex}`} className="h-4"></div>
            ))}
          </div>
        </div>
        <div className="flex">
          {/* Day labels column */}
          <div className="flex w-10 flex-shrink-0 flex-col justify-between pr-2 text-xs text-gray-500 dark:text-gray-400">
            {/* Adjust spacing/alignment based on cell size */}
            <div className="h-[15px]"></div> {/* Top Spacer */}
            <div className="h-[15px]">{visibleDayLabels[1]}</div> {/* Mon */}
            <div className="h-[15px]"></div>
            <div className="h-[15px]">{visibleDayLabels[3]}</div> {/* Wed */}
            <div className="h-[15px]"></div>
            <div className="h-[15px]">{visibleDayLabels[5]}</div> {/* Fri */}
            <div className="h-[15px]"></div> {/* Bottom Spacer */}
          </div>

          {/* Contribution grid */}
          <div className="grid flex-1 grid-flow-col gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-flow-row gap-[3px]">
                {week.map((day, dayIndex) => {
                  // Handle null days (empty cells before start or after end)
                  if (!day?.date) {
                    // Use a neutral, slightly transparent background for empty cells
                    return (
                      <div
                        key={`empty-${weekIndex}-${dayIndex}`}
                        className="h-[15px] w-[15px] rounded-sm bg-gray-100 opacity-70 dark:bg-gray-800"
                      ></div>
                    );
                  }

                  const level = getContributionLevel(day.count);
                  // Define colors including a specific one for level 0 (no contributions)
                  const bgColorClass = [
                    "bg-gray-200 dark:bg-gray-700", // Level 0
                    "bg-green-200 dark:bg-green-900", // Level 1
                    "bg-green-400 dark:bg-green-700", // Level 2
                    "bg-green-600 dark:bg-green-500", // Level 3
                    "bg-green-800 dark:bg-green-300", // Level 4
                  ][level];

                  return (
                    <TooltipProvider key={`${weekIndex}-${dayIndex}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`h-[15px] w-[15px] rounded-sm ${bgColorClass}`} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {day.count === 1 ? `1 contribution` : `${day.count} contributions`} on{" "}
                            {formatDate(day.date)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="mt-4 flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2 text-xs">
            <span>Less</span>
            {/* Match legend colors to the actual cell colors */}
            <div
              className="h-[15px] w-[15px] rounded-sm bg-gray-200 dark:bg-gray-700"
              title="0 contributions"
            ></div>
            <div
              className="h-[15px] w-[15px] rounded-sm bg-green-200 dark:bg-green-900"
              title="1-3 contributions"
            ></div>
            <div
              className="h-[15px] w-[15px] rounded-sm bg-green-400 dark:bg-green-700"
              title="4-6 contributions"
            ></div>
            <div
              className="h-[15px] w-[15px] rounded-sm bg-green-600 dark:bg-green-500"
              title="7-10 contributions"
            ></div>
            <div
              className="h-[15px] w-[15px] rounded-sm bg-green-800 dark:bg-green-300"
              title="11+ contributions"
            ></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
