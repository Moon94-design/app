import xlsx from "xlsx";

const wb = xlsx.readFile("1/차량관리.xls.xlsx");
console.log("Sheets:", wb.SheetNames);

const ws = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(ws, { defval: "" });

console.log("\nTotal rows:", data.length);
console.log("\nFirst 5 rows:");
console.log(JSON.stringify(data.slice(0, 5), null, 2));

if (data.length > 0) {
  console.log("\nColumn names:");
  console.log(Object.keys(data[0]));
}
