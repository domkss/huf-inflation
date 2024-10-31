import CurrencyChart from "../components/view/CurrencyChart";
import MapCalculator from "../components/view/MapCalculator";

export default async function Home() {
  async function getExchangeData() {
    const dataToRequest = [
      {
        startDate: "2014-01-01",
        baseCurrency: "EUR",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Euró",
      },
      {
        startDate: "2014-01-01",
        baseCurrency: "USD",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Amerikai dollár",
      },
      {
        startDate: "2014-01-01",
        baseCurrency: "CHF",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Svájci frank",
      },
      {
        startDate: "2014-01-01",
        baseCurrency: "CZK",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Cseh korona",
      },
      {
        startDate: "2014-01-01",
        baseCurrency: "PLN",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Lengyel zloty",
      },
      {
        startDate: "2014-01-01",
        baseCurrency: "CNY",
        targetCurrency: "HUF",
        baseCurrencyLongName: "Kínai jüan",
      },
    ];

    return Promise.all(
      dataToRequest.map(async (item) => {
        const startDate = item.startDate;
        const endDate = new Date().toISOString().split("T")[0];
        const baseCurrency = item.baseCurrency;
        const targetCurrency = item.targetCurrency;
        const baseCurrencyLongName = item.baseCurrencyLongName;
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

        const shortLabel = baseCurrency + "/" + targetCurrency;
        const labels = Object.keys(data.rates);
        const values = labels.map((date) => rates[date].HUF as number);

        return { shortLabel, labels, values, targetCurrency, baseCurrencyLongName };
      })
    );
  }

  const chartData = (await getExchangeData()).filter((item) => item !== null);

  return (
    <main className='w-full min-h-svh grid grid-cols-1 sm:grid-cols-2 p-8'>
      <div>
        <MapCalculator />
      </div>
      <div>
        <CurrencyChart data={chartData} />
      </div>
    </main>
  );
}
