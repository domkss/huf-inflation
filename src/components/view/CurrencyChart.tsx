"use client";
import React, { ReactElement } from "react";
import CurvedLineChart from "../charts/CurvedLineChart";
import ChartStatView from "../charts/ChartStatView";
import clsx from "clsx";
import { useState, useEffect } from "react";

interface CurrencyChartProps {
  data: {
    shortLabel: string;
    labels: string[];
    values: number[];
    targetCurrency: string;
    baseCurrencyLongName: string;
    countryFlag: ReactElement;
  }[];
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
  const shortLabel = props.data[selectedItem].shortLabel;
  const baseCurrencyLongName = props.data[selectedItem].baseCurrencyLongName;
  const labels = props.data[selectedItem].labels;
  const values = props.data[selectedItem].values;
  const targetCurrency = props.data[selectedItem].targetCurrency;
  const countryFlag = props.data[selectedItem].countryFlag;

  return (
    <div className='border rounded-lg to-[#ffffff28] border-[#1b2c686c] bg-gradient-to-r from-[#6ff8ed1e] shadow-sm'>
      <div className='flex flex-row'>
        <div className='h-[1px] w-full bg-gradient-to-r from-transparent via-pink-400 to-violet-500'></div>
        <div className='h-[1px] w-full bg-gradient-to-r from-violet-500 to-transparent'></div>
      </div>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        <div className='p-2'>
          <div className='text-center mb-2'>
            {countryFlag}
            <span className='ml-1'>
              {shortLabel} - {baseCurrencyLongName}
            </span>
          </div>
          <div className='text-center my-1'>
            <ChartStatView labels={labels} values={values} />
          </div>
        </div>
        <div className='border-t-[2px] border-indigo-500 p-2 sm:p-4'>
          <CurvedLineChart data={values} lables={labels} timeUnit='month' targetCurrency={targetCurrency} />
        </div>
      </div>
      <div className='text-center mb-3'>
        {props.data.map((_, index) => (
          <span
            key={index}
            onClick={() => {
              handleDotClick(index);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
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
