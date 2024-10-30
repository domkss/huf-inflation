import CurrencyChart from "./components/view/CurrencyChart";
import MapCalculator from "./components/view/MapCalculator";

export default function Home() {
  return (
    <main className='w-full min-h-svh grid grid-cols-2 p-8'>
      <div>
        <MapCalculator />
      </div>
      <div>
        <CurrencyChart />
      </div>
    </main>
  );
}
