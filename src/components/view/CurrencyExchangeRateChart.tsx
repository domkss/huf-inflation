"use client";
import React, { ReactElement } from "react";
import CurvedLineChart from "../charts/CurvedLineChart";
import ChartStatView from "../charts/ChartStatView";
import clsx from "clsx";
import { useState, useEffect } from "react";

interface CurrencyExchangeRateChartProps {
  exchangeData: {
    labels: string[];
    values: number[];
    targetCurrency: string;
    baseCurrency: string;
    baseCurrencyLongName: string;
    countryFlag: ReactElement;
  }[];
}

function CurrencyExchangeRateChart(props: CurrencyExchangeRateChartProps) {
  const [selectedItem, setSelectedItem] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  //Step carousel
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setSelectedItem((prevIndex) => (prevIndex + 1) % props.exchangeData.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [selectedItem, isHovered, props.exchangeData.length]);

  //Handle carousel dot click
  const handleDotClick = (index: number) => {
    setSelectedItem(index);
  };

  //Return null for an empty dataset
  if (!props.exchangeData || props.exchangeData.length === 0 || props.exchangeData[selectedItem].values.length < 2)
    return null;
  const shortLabel =
    props.exchangeData[selectedItem].baseCurrency + "/" + props.exchangeData[selectedItem].targetCurrency;
  const baseCurrencyLongName = props.exchangeData[selectedItem].baseCurrencyLongName;
  const labels = props.exchangeData[selectedItem].labels;
  const values = props.exchangeData[selectedItem].values;
  const baseCurrency = props.exchangeData[selectedItem].baseCurrency;
  const targetCurrency = props.exchangeData[selectedItem].targetCurrency;
  const countryFlag = props.exchangeData[selectedItem].countryFlag;

  const dayliChange = values.at(-1)! - values.at(-2)!;

  return (
    <div className='h-full'>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        <div className='p-2'>
          <div className='text-center'>
            {countryFlag}
            <span className='ml-1'>
              {shortLabel} - {baseCurrencyLongName}
            </span>
          </div>
          <div className={clsx("text-center mb-2 mt-1 text-xl", dayliChange > 0 ? "text-red-400" : "text-emerald-400")}>
            {`1 ${baseCurrency} = ${values[values.length - 1].toFixed(2)} ${targetCurrency}`}
          </div>

          <div className='text-center my-1'>
            <ChartStatView labels={labels} values={values} />
          </div>
        </div>
        <div className='lg:border-t-[2px] border-indigo-500 p-2 sm:p-4'>
          <CurvedLineChart data={values} lables={labels} timeUnit='month' targetCurrency={targetCurrency} />
        </div>
      </div>
      <div className='text-center mb-3'>
        {props.exchangeData.map((_, index) => (
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

export default CurrencyExchangeRateChart;
