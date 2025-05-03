"use client";

import { useState } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ActivityCalendar() {
  // Generate fake contribution data for a year
  const [contributionData] = useState(() => {
    const data = [];
    const startDate = new Date(2023, 4, 1); // May 1, 2023
    const endDate = new Date(2024, 3, 30); // April 30, 2024

    // Loop through each day in the date range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Generate a random contribution count (weighted to have more lower values)
      const rand = Math.random();
      let count = 0;

      if (rand > 0.7) count = Math.floor(Math.random() * 5) + 1;
      if (rand > 0.85) count = Math.floor(Math.random() * 10) + 5;
      if (rand > 0.95) count = Math.floor(Math.random() * 15) + 10;

      data.push({
        date: new Date(d),
        count,
      });
    }

    return data;
  });

  // Get all months in the range
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2023, i + 4, 1);
    if (date.getMonth() > 11) {
      date.setFullYear(2024);
      date.setMonth(date.getMonth() - 12);
    }
    return date;
  });

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

  // Group contributions by week
  const weeks: { date: Date | null; count: number }[][] = [];
  let currentWeek: { date: Date | null; count: number }[] = [];
  let currentDay = 0;

  // Start with the first Monday
  const firstDate = new Date(contributionData[0].date);
  const daysToAdd = (8 - firstDate.getDay()) % 7;
  const startIndex = daysToAdd;

  // Fill in empty cells for the first week if needed
  for (let i = 0; i < startIndex; i++) {
    currentWeek.push({ date: null, count: 0 });
    currentDay++;
  }

  // Fill in the contribution data
  contributionData.forEach((day, index) => {
    if (index < startIndex) return; // Skip days before the first Monday

    currentWeek.push(day);
    currentDay++;

    if (currentDay === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
      currentDay = 0;
    }
  });

  // Add the last partial week if needed
  if (currentWeek.length > 0) {
    weeks.push([...currentWeek]);
  }

  // Get the day labels (Mon, Wed, Fri)
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const visibleDayLabels = ["Mon", "", "Wed", "", "Fri", "", ""];

  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <div className="flex flex-col">
        {/* Month labels */}
        <div className="mb-1 flex pl-10 text-sm text-gray-500">
          {months.map((month, i) => (
            <div key={i} className="flex-1 text-center">
              {month.toLocaleDateString("en-US", { month: "short" })}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex w-10 flex-col justify-around pr-2 text-sm text-gray-500">
            {visibleDayLabels.map((day, i) => (
              <div key={i} className="h-[17px]">
                {day}
              </div>
            ))}
          </div>

          {/* Contribution grid */}
          <div className="grid flex-1 grid-flow-col gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-flow-row gap-[3px]">
                {week.map((day, dayIndex) => {
                  if (day === null) {
                    return <div key={`empty-${dayIndex}`} className="h-[15px] w-[15px]"></div>;
                  }

                  const level = getContributionLevel(day.count);
                  const bgColorClass = [
                    "bg-gray-100",
                    "bg-green-100",
                    "bg-green-300",
                    "bg-green-500",
                    "bg-green-700",
                  ][level];

                  return (
                    <TooltipProvider key={dayIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`h-[15px] w-[15px] rounded-sm ${bgColorClass}`} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {day.count} contributions on {day.date ? formatDate(day.date) : "N/A"}
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
        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
          <div>
            <button className="text-sm text-gray-500 underline hover:text-gray-700">
              Learn how we count contributions
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="h-[15px] w-[15px] rounded-sm bg-gray-100"></div>
            <div className="h-[15px] w-[15px] rounded-sm bg-green-100"></div>
            <div className="h-[15px] w-[15px] rounded-sm bg-green-300"></div>
            <div className="h-[15px] w-[15px] rounded-sm bg-green-500"></div>
            <div className="h-[15px] w-[15px] rounded-sm bg-green-700"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
