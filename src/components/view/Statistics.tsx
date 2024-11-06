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
  hungarianBondData: BondType[] | null;
  usTreasuryData: {
    date: string;
    value: number;
  }[];
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
  //Return null for an empty dataset
  if (!props.exchangeData || props.exchangeData.length === 0 || props.exchangeData[0].values.length < 2) return null;

  if (!props.hungarianBondData || props.hungarianBondData.length === 0) return null;

  const HUFWeakening = new Map<string, number>();
  const startDate = "2014-01-01";

  props.exchangeData.forEach((item) => {
    HUFWeakening.set(
      item.baseCurrency,
      averageYearlyPercentageIncrease(item.labels, item.values, new Date(startDate).getFullYear())
    );
  });

  const sortedExchangeData = props.exchangeData.sort((a, b) => {
    const valueA = HUFWeakening.get(a.baseCurrency) || 0;
    const valueB = HUFWeakening.get(b.baseCurrency) || 0;

    return valueB - valueA;
  });

  const filteredHUFAKKBondRates = filterAKKBonds({
    bonds: props.hungarianBondData,
    excludeTypeFilter: ["BABA", "EMÁP", "PEMÁP"],
    startDate: startDate,
  });

  const filteredEURAKKBondRates = filterAKKBonds({
    bonds: props.hungarianBondData,
    typeFilter: ["EMÁP", "PEMÁP"],
    startDate: startDate,
  });

  const filteredUSTreasuryData = props.usTreasuryData.filter(
    (item) => new Date(item.date) > new Date(startDate) && Number.isSafeInteger(item.value)
  );

  const EURBondRate = (
    filteredEURAKKBondRates.reduce((sum, rating) => sum + (rating.ehm_val || rating.rate_val), 0) /
    filteredEURAKKBondRates.length
  ).toFixed(2);

  const USBondRate = (
    filteredUSTreasuryData.reduce((sum, rating) => sum + rating.value, 0) / filteredUSTreasuryData.length
  ).toFixed(2);

  const HUNBondRate = (
    filteredHUFAKKBondRates.reduce((sum, rating) => sum + (rating.ehm_val || rating.rate_val), 0) /
    filteredHUFAKKBondRates.length
  ).toFixed(2);

  return (
    <div className='h-full mb-4 lg:mb-0'>
      <div>
        <div className='mt-4 text-center text-lg'>
          Lakossági Magyar Állampapír <br /> Kamatstatisztika
        </div>
        <div className='text-center mb-3'>
          {startDate.replaceAll("-", ".")} - {new Date().toISOString().split("T")[0].replaceAll("-", ".")}
        </div>
      </div>
      <div>
        <div className='mb-4 px-2'>
          <div className='text-center text-lg mb-2'>Átlagos éves forint gyengülés:</div>

          <ul>
            {sortedExchangeData.map((exchangeData, key) => (
              <li key={key} className='flex justify-center'>
                <div className='flex justify-between xl:basis-1/2 basis-full'>
                  <div>
                    <span className='mr-2'>{exchangeData.countryFlag}</span>
                    {`${exchangeData.baseCurrencyLongName} - ${exchangeData.baseCurrency}/${exchangeData.targetCurrency}:`}
                  </div>

                  <div className='text-red-500 '>
                    {Number(HUFWeakening.get(exchangeData.baseCurrency)) > 0 ? "+" : ""}
                    {HUFWeakening.get(exchangeData.baseCurrency)?.toFixed(2) + "%"}
                  </div>
                </div>
                <div></div>
              </li>
            ))}
          </ul>
        </div>

        <div className='mb-4 px-2'>
          <div className='text-center text-lg mb-2'>Átlagos évenkénti állampapír kamat:</div>
          <ul className='mb-2'>
            <li className='flex justify-center'>
              <div className='flex justify-between xl:basis-1/2 basis-full'>
                <div>
                  <span className='mr-2 fi fi-hu' />
                  Forint Magyar állampapír:
                </div>
                <div className='my-auto'>{"*" + HUNBondRate + "%"}</div>
              </div>
            </li>
            <li className='flex justify-center'>
              <div className='flex justify-between xl:basis-1/2 basis-full'>
                <div>
                  <span className='mr-2 fi fi-eu' />
                  Euró Magyar állampapír (EMÁP,PEMÁP):
                </div>
                <div className='my-auto'>{EURBondRate + "%"}</div>
              </div>
            </li>
            {filteredUSTreasuryData.length > 0 ? (
              <li className='flex justify-center'>
                <div className='flex justify-between xl:basis-1/2 basis-full'>
                  <div>
                    <span className='mr-2 fi fi-us' />
                    Amerikai 5 éves állampapír:
                  </div>
                  <div className='my-auto'>{USBondRate + "%"}</div>
                </div>
              </li>
            ) : null}
          </ul>
          <div className='text-sm text-gray-500 mx-4 text-center'>
            *A számítás során a babakötvények kamatai nem lettek figyelembevéve, mivel ezek kizárólag gyermekek számára
            vásárolhatók meg.
          </div>
        </div>
      </div>
      <div className='text-center'>
        <div className='text-lg border-t-2 p-4'>
          A forint átlagos éves gyengülése az euróhoz képest, valamint az euróban denominált magyar állampapírok átlagos
          éves kamata
        </div>
        <div className='p-2 flex items-center justify-center flex-col sm:flex-row'>
          <div className=''>
            <div>
              <span className='fi fi-eu' />
            </div>
            <div>{`${HUFWeakening.get("EUR")?.toFixed(2)}% (EUR/HUF) + ${EURBondRate}% (EMÁP) =
          ${((HUFWeakening.get("EUR") ?? 0) + Number(EURBondRate)).toFixed(2)}%`}</div>
          </div>
          <div className='text-6xl text-green-500 font-bold sm:mt-6 mx-2'>
            {(HUFWeakening.get("EUR") ?? 0) + Number(EURBondRate) > Number(HUNBondRate) ? ">" : "<"}
          </div>
          <div className=''>
            <div>
              <span className='fi fi-hu' />
            </div>
            <div>{`Forint alapú állampapír kamat: ${HUNBondRate}%`}</div>
          </div>
        </div>
        <div>
          <div className='px-4 sm:px-8 mb-6'>
            {(HUFWeakening.get("EUR") ?? 0) + Number(EURBondRate) > Number(HUNBondRate)
              ? `Ez alapján a magyar euródenominált állampapírokban tartott vagyon nagyobb hozamot ért el a vizsgált
            időszakban, mivel a forint euróval szembeni gyengülése, valamint az euró alapú állampapírok kedvező hozamai együttesen
            átlagosan magasabb hozamot biztosítottak mint a forint alapú állampapírok.`
              : `A vizsgált időszak eredményei szerint a forint alapú állampapírokban való megtakarítás volt a kedvezőbb 
              választás, mivel ezek stabilabb hozamot kínáltak, 
              így biztonságosabb alternatívát jelentettek a devizakockázat elkerülése érdekében.`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
