import React from "react";
import CurvedLineChart from "../charts/CurvedLineChart";

async function CurrencyChart() {
  const startDate = "2014-01-01";
  const endDate = "2024-12-30";
  const baseCurrency = "EUR";
  const targetCurrency = "HUF";

  // Fetch data from the Frankfurter API
  const res = await fetch(
    `https://api.frankfurter.app/${startDate}..${endDate}?base=${baseCurrency}&symbols=${targetCurrency}`,
    {
      cache: "force-cache",
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch exchange rates:", res.statusText);
    return null;
  }

  const data = await res.json();
  const rates = data.rates;

  if (!data || !rates) {
    console.error("Failed get data from Json");
    return null;
  }

  const mainLabel = baseCurrency + "/" + targetCurrency;
  const labels = Object.keys(data.rates);
  const values = labels.map((date) => rates[date].HUF);

  return (
    <div className='p-4'>
      <CurvedLineChart yTitle='HUF' data={values} lables={labels} mainLabel={mainLabel} timeUnit='month' />
      <div className='text-center'>selector</div>
    </div>
  );
}

export default CurrencyChart;
