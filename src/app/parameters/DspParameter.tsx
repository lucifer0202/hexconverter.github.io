"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function DspParameter({ title }: { title: string }) {
  const [hexString, setHexString] = useState("");

  const handleGenerateExcel = () => {
    if (!hexString) return alert("Please enter a hex string!");

    const parameters = [
      { name: "Sequence Number", length: 2 * 4, type: "int" },
      { name: "Command", length: 2 * 4, type: "int" },
      { name: "Command Type", length: 2 * 4, type: "int" },
      { name: "Data Length", length: 2 * 4, type: "int" },
      { name: "No. of Sheets [Fixed]", length: 2, type: "int" },
      { name: "Sheet Index [Fixed]", length: 2, type: "int" },
      { name: "System Mode", length: 2, type: "int" },
      { name: "Wind Computation Mode [Fixed]", length: 2, type: "int" },
      { name: "Reference Timing Signals [Fixed]", length: 2, type: "int" },
      { name: "Inter Pulse Period (IPP)", length: 4 * 2, type: "float" },
      { name: "Code Baud", length: 4 * 2, type: "float" },
      { name: "Code Length", length: 2 * 2, type: "int" },
      {
        name: "Number of Coherent Integrations (NCI)",
        length: 2 * 2,
        type: "int",
      },
      { name: "Number of FFT Points (NFFT)", length: 2 * 2, type: "int" },
      { name: "FFT Window Type [PRO]", length: 2, type: "int" },
      {
        name: "Number of In-Coherent Integration (NIC) [PRO]",
        length: 2,
        type: "int",
      },
      { name: "Code Flag [PRO]", length: 2, type: "int" },
      { name: "Code Type [Fixed]", length: 2, type: "int" },
      { name: "Code A [PRO]", length: 2 * 32, type: "int" },
      { name: "Code B [PRO]", length: 2 * 32, type: "int" },
      { name: "Code [Fixed]", length: 2 * 32, type: "int" },
      { name: "Tx Pulse Start", length: 2 * 4, type: "float" },
      { name: "RxSim Pulse Start [PRO]", length: 2 * 4, type: "float" },
      { name: "Min Range [PRO]", length: 2 * 4, type: "float" },
      { name: "Max Range [PRO]", length: 2 * 4, type: "float" },
      { name: "Range Bias (Fixed)", length: 2 * 4, type: "float" },
      { name: "Number of Beams [PRO]", length: 2, type: "int" },
      { name: "Beam Sequence [FIXED]", length: 2 * 32, type: "string" },
      {
        name: "Scan Angle [FIXED] Elevation Angle",
        length: 2 * 36,
        type: "float",
      },
      {
        name: "Scan Angle [FIXED] Azimuth Angle",
        length: 2 * 36,
        type: "float",
      },
      { name: "Beam Gap [Fixed]", length: 4, type: "int" },
      { name: "Consensus Average Count [Fixed]", length: 2 * 4, type: "float" },
      {
        name: "Consensus Average Threshold [PRO]",
        length: 2 * 4,
        type: "float",
      },
      { name: "Scan Cycles =1 (Fixed)", length: 2 * 4, type: "int" },
      { name: "Sheet Name", length: 2 * 20, type: "string" },
    ];

    let index = 0;
    const extractedData = parameters.map((param) => {
      const hexValue = hexString.slice(index, index + param.length);
      index += param.length;

      // Split into 8-character chunks for scan angles
      if (
        param.name.includes("Scan Angle [FIXED] Elevation Angle") ||
        param.name.includes("Scan Angle [FIXED] Azimuth Angle")
      ) {
        return hexValue.match(/.{1,8}/g) || [];
      }

      return hexValue;
    });

    // Convert Hex to Integer or Float
    const decodeHex: any = (hex: any, type: any) => {
      if (Array.isArray(hex)) {
        return hex.map((chunk) => decodeHex(chunk, type));
      }

      if (!hex || hex.length === 0) return "";

      if (type === "int") {
        // Convert Little Endian Hex to Integer
        const reversedHex = hex.match(/../g)?.reverse().join("");
        return parseInt(reversedHex, 16);
      } else if (type === "float") {
        if (hex.length !== 8) return "Invalid"; // Ensure 4-byte float

        // Reverse byte order for correct IEEE 754 decoding
        const reversedHex =
          hex.slice(6, 8) + hex.slice(4, 6) + hex.slice(2, 4) + hex.slice(0, 2);

        // Convert hex string to IEEE 754 float
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setUint32(0, parseInt(reversedHex, 16), false); // Big-endian

        const floatValue = view.getFloat32(0, false);

        return Number.isInteger(floatValue)
          ? floatValue.toFixed(0)
          : floatValue.toFixed(2);
      } else if (type === "string") {
        // Convert Hex to ASCII String (ignoring null characters)
        return hex
          .match(/../g)
          ?.map((byte: any) => String.fromCharCode(parseInt(byte, 16)))
          .join("")
          .replace(/\x00/g, ""); // Remove null characters
      } else {
        return ""; // Keep hex as string for other types
      }
    };

    const sheetData = [["Parameter Type", "Hex Code", "Decoded Value"]];

    extractedData.forEach((hexValue, i) => {
      if (Array.isArray(hexValue)) {
        hexValue.forEach((chunk) => {
          sheetData.push([
            parameters[i].name,
            chunk,
            decodeHex(chunk, parameters[i].type),
          ]);
        });
      } else {
        sheetData.push([
          parameters[i].name,
          hexValue,
          decodeHex(hexValue, parameters[i].type),
        ]);
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(file, "dsp_hex.xlsx");
  };
  return (
    <div className="border-2 border-[#a99999] rounded-lg p-4 mb-6 w-full">
      <h2 className="text-red-600 font-bold mb-2">{title}</h2>

      <textarea
        className="border-2 border-orange-400 p-4 h-20 w-full text-red-500 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
        placeholder="COPY/PASTE OR INPUT STRING"
        value={hexString}
        onChange={(e) => setHexString(e.target.value)}
      />

      <div className="flex justify-between items-center mt-2">
        <span className="text-green-600 text-sm">
          FORMAT STRING DATA INTO EXCEL &gt;&gt;
        </span>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleGenerateExcel}
        >
          Download
        </Button>
      </div>
    </div>
  );
}
export default DspParameter;
