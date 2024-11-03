import Footer from "@/components/view/Footer";
import CurrencyExchangeRateChart from "../components/view/CurrencyExchangeRateChart";
import Statistics from "../components/view/Statistics";
import { BondType } from "../components/view/Statistics";

export default async function Home() {
  //#region Get Data

  // Get US treasury data
  async function getUSTreasuryData(): Promise<{ date: string; value: number }[]> {
    const url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS5&cosd=2014-01-01&fq=Daily";

    try {
      const response = await fetch(url, {
        cache: "force-cache",
        headers: {
          "Cache-Control": "public, max-age=86400",
        },
      });

      // Check if the response is OK (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const csvData = await response.text();
      const lines = csvData.split("\n");

      const result: { date: string; value: number }[] = [];

      // Skip the header and iterate over each line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          // Check for non-empty line
          const [date, valueStr] = line.split(",");
          const value = parseFloat(valueStr);
          result.push({ date, value });
        }
      }

      return result;
    } catch (error) {
      console.error("Error fetching treasury data:", error);
      return []; // Return an empty array on error
    }
  }

  // Get exchange data from frankfurt API (ECB)
  async function getCurrencyExchangeRateData() {
    const dataToRequest = [
      {
        startDate: "2011-05-01",
        baseCurrency: "EUR",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Euró",
        countryFlag: <span className='fi fi-eu shadow-sm' />,
      },
      {
        startDate: "2011-05-01",
        baseCurrency: "USD",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Amerikai dollár",
        countryFlag: <span className='fi fi-us shadow-sm' />,
      },
      {
        startDate: "2011-05-01",
        baseCurrency: "CHF",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Svájci frank",
        countryFlag: <span className='fi fi-ch shadow-sm' />,
      },
      {
        startDate: "2011-05-01",
        baseCurrency: "CZK",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Cseh korona",
        countryFlag: <span className='fi fi-cz shadow-sm' />,
      },
      {
        startDate: "2011-05-01",
        baseCurrency: "PLN",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Lengyel zloty",
        countryFlag: <span className='fi fi-pl shadow-sm' />,
      },
      {
        startDate: "2011-05-01",
        baseCurrency: "CNY",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Kínai jüan",
        countryFlag: <span className='fi fi-cn shadow-sm' />,
      },
    ];

    return Promise.all(
      dataToRequest.map(async (item) => {
        const startDate = item.startDate;
        const endDate = new Date().toISOString().split("T")[0];
        const baseCurrency = item.baseCurrency;
        const targetCurrency = item.targetCurrency;
        const baseCurrencyLongName = item.baseCurrencyLongName;
        const countryFlag = item.countryFlag;
        // Fetch data from the Frankfurter API

        const res = await fetch(
          `https://api.frankfurter.app/${startDate}..${endDate}?base=${baseCurrency}&symbols=${targetCurrency}`,
          {
            cache: "force-cache",
            headers: {
              "Cache-Control": "public, max-age=86400",
            },
          }
        ).catch((e) => ({ ok: false, statusText: e, status: null }));

        if (!res.ok || res.status !== 200) {
          console.error("Failed to fetch exchange rates:", res.statusText);
          return Promise.resolve(null);
        }

        const data = await res.json();
        const rates = data.rates;

        if (!data || !rates) {
          console.error("Failed get data from Json");
          return Promise.resolve(null);
        }

        const labels = Object.keys(data.rates);
        const values = labels.map((date) => rates[date].HUF as number);

        return { labels, values, baseCurrency, targetCurrency, baseCurrencyLongName, countryFlag };
      })
    );
  }

  // Get AKK treasury data
  async function getAKKBondData() {
    const res = await fetch(`https://www.allampapir.hu/api/retail_interest/m/get_all_data`, {
      cache: "force-cache",
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    }).catch((e) => ({ ok: false, statusText: e, status: null }));
    if (!res.ok || res.status !== 200) {
      console.error("Failed to fetch exchange rates:", res.statusText);
      return [];
    }

    const data = await res.json();
    const bonds: BondType[] = data.data.data;
    return bonds.map((bond) => ({ ...bond, longName: hungarianBondTypeMapping[bond.type] || bond.name }));
  }

  const hungarianBondTypeMapping: Record<string, string> = {
    "1MÁP": "1 éves Magyar Állampapír Plusz",
    PMÁP: "Prémium Magyar Állampapír",
    BMÁP: "Bónusz Magyar Állampapír",
    PEMÁP: "Prémium Euró Magyar Állampapír",
    "MÁP Plusz": "Magyar Állampapír Plusz",
    FixMÁP: "Fix Magyar Állampapír",
    EMÁP: "Értékpapír Magyar Állampapír",
    "2MÁP": "2 éves Magyar Állampapír",
    KTJ: "Kincstári Takarékjegy",
    "KTJ Plusz": "Kincstári Takarékjegy Plusz",
    "KTJ I": "Kincstári Takarékjegy I.",
    "KTJ II": "Kincstári Takarékjegy II.",
    BABA: "Babakötvény",
  };

  //#endregion

  const currencyExchangeData = (await getCurrencyExchangeRateData())
    .filter((item) => item !== null)
    .filter((item) => item.values.length > 0);

  const akkBondData = await getAKKBondData();
  if (currencyExchangeData.length === 0 || akkBondData.length === 0)
    throw new Error("Failed to get data from the server");

  const usTreasuryData = await getUSTreasuryData();

  return (
    <main className='w-full min-h-svh'>
      <div className='flex flex-row'>
        <div className='h-[1px] w-full bg-gradient-to-r from-transparent via-pink-400 to-violet-500'></div>
        <div className='h-[1px] w-full bg-gradient-to-r from-violet-500 to-transparent'></div>
      </div>
      <div className='flex flex-col lg:flex-row-reverse  min-h-svh'>
        <div className='sm:flex-1'>
          <CurrencyExchangeRateChart exchangeData={currencyExchangeData} />
        </div>
        <div className='sm:flex-1 border-r border-[#1b2c686c]'>
          <Statistics
            exchangeData={currencyExchangeData}
            hungarianBondData={akkBondData}
            usTreasuryData={usTreasuryData}
          />
        </div>
      </div>
      <div className='flex flex-row'>
        <div className='h-[1px] w-full bg-gradient-to-r from-transparent via-pink-400 to-violet-500'></div>
        <div className='h-[1px] w-full bg-gradient-to-r from-violet-500 to-transparent'></div>
      </div>
      <Footer />
    </main>
  );
}
