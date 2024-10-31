// components/CurvedLineChart.tsx
"use client";
import React, { useRef, useEffect } from "react";
import { Chart, registerables, ChartDataset } from "chart.js";
import "chartjs-adapter-date-fns";

// Register the necessary components from Chart.js
Chart.register(...registerables);
type TimeUnits =
  | false
  | "month"
  | "millisecond"
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "quarter"
  | "year"
  | undefined;

interface CurvedLineChartProps {
  className?: string;
  xTitle?: string;
  lables: string[];
  data: number[];
  timeUnit: TimeUnits;
  targetCurrency: string;
}

const CurvedLineChart: React.FC<CurvedLineChartProps> = (props) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: props.lables,
        datasets: [
          {
            fill: true,
            lineTension: 0.4,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            pointRadius: 0,
            pointHoverRadius: 0,
            borderWidth: 2,
            data: props.data,
          } as ChartDataset<"line">,
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "nearest",
            intersect: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: props.xTitle,
            },
            type: "time",
            time: {
              unit: props.timeUnit,
            },
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: function (value) {
                return value + ` ${props.targetCurrency}`;
              },
            },
          },
        },
      },
    });

    // Clean up the chart instance when the component unmounts
    return () => {
      myChart.destroy();
    };
  }, [props.data, props.lables, props.timeUnit, props.xTitle]);

  return (
    <div className={props.className}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default CurvedLineChart;
