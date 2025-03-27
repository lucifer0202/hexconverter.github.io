import ExcelGenerator from "./ExcelGenerator";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Hex to Excel Converter</h1>
      <ExcelGenerator />
    </main>
  );
}
