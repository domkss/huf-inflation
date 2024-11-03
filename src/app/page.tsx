import Footer from "@/components/view/Footer";
import CurrencyExchangeRateChart from "../components/view/CurrencyExchangeRateChart";
import Statistics from "../components/view/Statistics";
import { BondType } from "../components/view/Statistics";

export default async function Home() {
  // Get exchange data from frankfurt API
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

  //#region AKK
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
    return bonds.map((bond) => ({ ...bond, longName: bondTypeMapping[bond.type] || bond.name }));
  }

  const bondTypeMapping: Record<string, string> = {
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
  console.log(currencyExchangeData);
  console.log(akkBondData);
  if (currencyExchangeData.length === 0 || akkBondData.length === 0)
    throw new Error("Failed to get data from the server");

  return (
    <main className='w-full min-h-svh'>
      <div className='flex flex-row'>
        <div className='h-[1px] w-full bg-gradient-to-r from-transparent via-pink-400 to-violet-500'></div>
        <div className='h-[1px] w-full bg-gradient-to-r from-violet-500 to-transparent'></div>
      </div>
      <div className='flex flex-col lg:flex-row  min-h-svh'>
        <div className='sm:flex-1 border-r border-[#1b2c686c]'>
          <Statistics exchangeData={currencyExchangeData} bondData={akkBondData} />
        </div>
        <div className='sm:flex-1'>
          <CurrencyExchangeRateChart exchangeData={currencyExchangeData} />
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
