"use client";
import React from "react";
import CurvedLineChart from "../charts/CurvedLineChart";
import ChartStatView from "../charts/ChartStatView";
import clsx from "clsx";
import { useState, useEffect } from "react";

interface CurrencyChartProps {
  data: { mainLabel: string; labels: string[]; values: number[]; targetCurrency: string }[];
}

function CurrencyChart(props: CurrencyChartProps) {
  const [selectedItem, setSelectedItem] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  //Step carousel
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setSelectedItem((prevIndex) => (prevIndex + 1) % props.data.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [selectedItem, isHovered, props.data.length]);

  //Handle carousel dot click
  const handleDotClick = (index: number) => {
    setSelectedItem(index);
  };

  //Return null for an empty dataset
  if (!props.data || props.data.length === 0) return null;
  const mainLabel = props.data[selectedItem].mainLabel;
  const labels = props.data[selectedItem].labels;
  const values = props.data[selectedItem].values;
  const targetCurrency = props.data[selectedItem].targetCurrency;

  return (
    <div className='p-4'>
      <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className='text-center mb-2'>{mainLabel}</div>
        <div className='text-center my-1'>
          <ChartStatView labels={labels} values={values} />
        </div>
        <CurvedLineChart data={values} lables={labels} timeUnit='month' targetCurrency={targetCurrency} />
      </div>
      <div className='text-center'>
        {props.data.map((_, index) => (
          <span
            key={index}
            onClick={() => {
              handleDotClick(index);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={clsx(
              "m-1 inline-block h-4 w-4 cursor-pointer rounded-full",
              selectedItem === index ? "bg-emerald-300" : "bg-slate-300/70"
            )}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default CurrencyChart;
