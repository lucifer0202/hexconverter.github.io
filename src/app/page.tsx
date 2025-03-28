"use client";
import { Button } from "@/components/ui/button";
import DspParameter from "./parameters/DspParameter";
import TcsgParameter from "./parameters/TcsgParamters";

export default function Home() {
  return (
    <div className="p-6 bg-white min-h-screen flex justify-start">
      <div className="w-full max-w-8xl h-full rounded-lg p-8 shadow-lg">
        <div className="flex justify-center mb-4">
          <button className="bg-black text-white font-bold px-4 py-2 rounded-md">
            XCELORE
          </button>
        </div>

        {/* Title */}
        <h1 className="text-center text-xl font-bold text-blue-600 mb-6">
          LITTLE ENDIAN HEX CODE CONVERTER
        </h1>

        <DspParameter title="DSP PARAMETERS" />

        <TcsgParameter title="TCSG PARAMETERS" />
      </div>
    </div>
  );
}
