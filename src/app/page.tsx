import CurrencyChart from "../components/view/CurrencyChart";
import MapCalculator from "../components/view/MapCalculator";

export default async function Home() {
  async function getExchangeData() {
    const dataToRequest = [
      { startDate: "2014-01-01", endDate: "2024-12-30", baseCurrency: "EUR", targetCurrency: "HUF" },
      { startDate: "2014-01-01", endDate: "2024-12-30", baseCurrency: "USD", targetCurrency: "HUF" },
      { startDate: "2014-01-01", endDate: "2024-12-30", baseCurrency: "CHF", targetCurrency: "HUF" },
    ];

    return Promise.all(
      dataToRequest.map(async (item) => {
        const startDate = item.startDate;
        const endDate = item.endDate;
        const baseCurrency = item.baseCurrency;
        const targetCurrency = item.targetCurrency;
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
        const values = labels.map((date) => rates[date].HUF as number);

        return { mainLabel, labels, values, targetCurrency };
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
