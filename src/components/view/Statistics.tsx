import React from "react";
import { ReactElement } from "react";

interface StatisticsProps {
  exchangeData: {
    labels: string[];
    values: number[];
    targetCurrency: string;
    baseCurrency: string;
    baseCurrencyLongName: string;
    countryFlag: ReactElement;
  }[];
  bondData: BondType[] | null;
}

export type BondType = {
  longName: string | undefined;
  tenor: string | null;
  rate: string;
  maturity: string | null;
  underIssue: boolean;
  name: string;
  validFrom: string;
  ehm: string | null;
  type: string;
  validTo: string;
  place: string;
  duration_val: number;
  rate_val: number;
  ehm_val: number;
  order: number;
  duration: string;
};

function filterAKKBonds({
  bonds,
  typeFilter,
  excludeTypeFilter,
  underIssue,
  startDate,
}: {
  bonds: BondType[];
  typeFilter?: string[];
  excludeTypeFilter?: string[];
  underIssue?: boolean;
  startDate?: string;
}): BondType[] {
  return bonds.filter((bond) => {
    const isTypeMatch = (typeFilter?.includes(bond.type) ?? true) && !excludeTypeFilter?.includes(bond.type);
    const isUnderIssueMatch = underIssue === undefined || bond.underIssue === underIssue;

    // Check if startDate is provided and validFrom date is later
    const isStartDateMatch = !startDate || new Date(bond.validFrom) > new Date(startDate);

    return isTypeMatch && isUnderIssueMatch && isStartDateMatch;
  });
}

function averageYearlyPercentageIncrease(dates: string[], values: number[], fromYear: number): number {
  const currentYear = new Date().getFullYear();
  const lastNYears = new Set<number>();

  for (let year = currentYear - (currentYear - fromYear - 1); year <= currentYear; year++) {
    lastNYears.add(year);
  }

  // Step 1: Group values by year
  const yearlyValues: { [year: number]: number[] } = {};
  for (let i = 0; i < dates.length; i++) {
    const year = new Date(dates[i]).getFullYear();
    if (lastNYears.has(year)) {
      if (!yearlyValues[year]) yearlyValues[year] = [];
      yearlyValues[year].push(values[i]);
    }
  }

  // Step 2: Calculate average forex value per year
  const yearlyAverages: { [year: number]: number } = {};
  for (const year in yearlyValues) {
    const yearlyData = yearlyValues[parseInt(year)];
    const average = yearlyData.reduce((a, b) => a + b, 0) / yearlyData.length;
    yearlyAverages[parseInt(year)] = average;
  }

  // Step 3: Calculate yearly percentage increases
  const sortedYears = Object.keys(yearlyAverages)
    .map(Number)
    .sort((a, b) => a - b);
  const yearlyPercentageIncreases: number[] = [];
  for (let i = 1; i < sortedYears.length; i++) {
    const prevYear = sortedYears[i - 1];
    const currentYear = sortedYears[i];
    const percentageIncrease =
      ((yearlyAverages[currentYear] - yearlyAverages[prevYear]) / yearlyAverages[prevYear]) * 100;
    yearlyPercentageIncreases.push(percentageIncrease);
  }

  // Step 4: Calculate average yearly percentage increase
  const avgYearlyPercentageIncrease =
    yearlyPercentageIncreases.reduce((a, b) => a + b, 0) / yearlyPercentageIncreases.length || 0;
  return avgYearlyPercentageIncrease;
}

function Statistics(props: StatisticsProps) {
  if (!props.bondData) return null;

  const startDate = "2014-01-01";

  const filteredHUFAKKBondRates = filterAKKBonds({
    bonds: props.bondData,
    excludeTypeFilter: ["BABA", "EMÁP", "PEMÁP"],
    startDate: startDate,
  });

  const filteredEURAKKBondRates = filterAKKBonds({
    bonds: props.bondData,
    typeFilter: ["EMÁP", "PEMÁP"],
    startDate: startDate,
  });

  return (
    <div>
      <div className='border rounded-lg to-[#ffffff28] border-[#1b2c686c] bg-gradient-to-r from-[#6ff8ed1e] shadow-sm'>
        <div className='flex flex-row'>
          <div className='h-[1px] w-full bg-gradient-to-r from-transparent via-pink-400 to-violet-500'></div>
          <div className='h-[1px] w-full bg-gradient-to-r from-violet-500 to-transparent'></div>
        </div>
        <div>
          <div className='mt-4 text-center text-lg'>
            Lakossági Magyar Állampapír <br /> Kamatstatisztika
          </div>
          <div className='text-center mb-3'>
            {startDate.replaceAll("-", ".")} - {new Date().toISOString().split("T")[0].replaceAll("-", ".")}
          </div>
        </div>
        <div>
          <div className='mb-4'>
            <div className='text-center text-lg'>Átlagos éves forint gyengülés:</div>

            <ul>
              {props.exchangeData.map((exchangeData, key) => (
                <li key={key} className='flex justify-center'>
                  <div className='flex justify-between xl:basis-1/2 basis-full'>
                    <div>{`${exchangeData.baseCurrencyLongName} - ${exchangeData.baseCurrency}/${exchangeData.targetCurrency}:`}</div>

                    <div className='text-red-500 '>
                      {averageYearlyPercentageIncrease(
                        exchangeData.labels,
                        exchangeData.values,
                        new Date(startDate).getFullYear()
                      ).toFixed(2) + "%"}
                    </div>
                  </div>
                  <div></div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className='text-center text-lg'>Átlagos évenkénti állampapír kamat:</div>
            <ul>
              <li className='flex justify-center'>
                <div className='flex justify-between xl:basis-1/3 basis-full'>
                  <div>Forint alapú állampapír kamat:</div>
                  {"*" +
                    (
                      filteredHUFAKKBondRates.reduce((sum, rating) => sum + (rating.ehm_val || rating.rate_val), 0) /
                      filteredHUFAKKBondRates.length
                    ).toFixed(2) +
                    "%"}
                </div>
              </li>
              <li className='flex justify-center'>
                <div className='flex justify-between xl:basis-1/3 basis-full'>
                  <div>Euró alapú állampapír kamat:</div>
                  {"*" +
                    (
                      filteredEURAKKBondRates.reduce((sum, rating) => sum + (rating.ehm_val || rating.rate_val), 0) /
                      filteredEURAKKBondRates.length
                    ).toFixed(2) +
                    "%"}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className='hidden'>
          <table>
            <tbody>
              <tr>
                <th>Sorozat</th>
                <th>Név</th>
                <th>Kamat mértéke</th>
                <th>EHM</th>
                <th>Érvényesség kezdete</th>
              </tr>
              {filteredEURAKKBondRates.map((item, key) => (
                <tr key={key}>
                  <td>{item.name !== item.type ? `${item.type} ${item.name}` : item.name}</td>
                  <td>{item.longName}</td>
                  <td>{item.rate}</td>
                  <td>{item.ehm || null}</td>
                  <td>{item.validFrom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
