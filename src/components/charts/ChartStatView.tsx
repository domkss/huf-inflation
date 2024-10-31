import React, { ReactElement } from "react";
import clsx from "clsx";

interface ChartStatViewProps {
  labels: string[];
  values: number[];
}

function ChartStatView({ values, labels }: ChartStatViewProps) {
  if (!labels || !values) return;
  // Get the latest date and corresponding value (last element in sorted arrays)
  const latestDateStr = labels[labels.length - 1];
  const latestValue = values[values.length - 1];
  const latestDate = new Date(latestDateStr);

  // Define the time offsets to calculate changes for
  const timeOffsets = {
    "10 year": new Date(latestDate),
    "5 year": new Date(latestDate),
    "1 year": new Date(latestDate),
    "6 month": new Date(latestDate),
    "1 month": new Date(latestDate),
  };

  // Subtract years and months from the latest date for each offset
  timeOffsets["10 year"].setFullYear(latestDate.getFullYear() - 10);
  timeOffsets["5 year"].setFullYear(latestDate.getFullYear() - 5);
  timeOffsets["1 year"].setFullYear(latestDate.getFullYear() - 1);
  timeOffsets["6 month"].setMonth(latestDate.getMonth() - 6);
  timeOffsets["1 month"].setMonth(latestDate.getMonth() - 1);

  // Function to find the closest date value in the past or on target date
  function findClosestValue(targetDate: Date): number | null {
    for (let i = labels.length - 1; i >= 0; i--) {
      const date = new Date(labels[i]);
      if (date <= targetDate) {
        return values[i];
      }
    }
    return null; // No valid date found
  }

  // Calculate the percentage changes and build the result string
  const result: ReactElement[] = [];

  for (const [label, targetDate] of Object.entries(timeOffsets)) {
    const previousValue = findClosestValue(targetDate);
    if (previousValue !== null) {
      const percentageChange = ((latestValue - previousValue) / previousValue) * 100;
      const sign = percentageChange >= 0 ? "+" : "";
      result.push(
        <div className='grid grid-cols-1 gap-y-2 text-center sm:text-left'>
          <div className='flex flex-col items-center sm:items-start'>
            <span className='text-gray-700 break-words'>{label}:</span>
            <span className={clsx("break-words", { "text-red-400": sign === "+" })}>
              {sign}
              {percentageChange.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    } else {
      result.push(
        <div className='grid grid-cols-2 gap-y-2 text-center sm:text-left'>
          <div className='flex flex-col items-center sm:items-start'>
            <span className='text-gray-700 break-words'>{label}: N/A</span>
          </div>
        </div>
      );
    }
  }

  return (
    <div className='w-full flex flex-row justify-around'>
      {result.map((content, key) => (
        <div className={""} key={key}>
          {content}
        </div>
      ))}
    </div>
  );
}

export default ChartStatView;
