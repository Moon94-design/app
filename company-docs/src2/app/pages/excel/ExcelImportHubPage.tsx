import { useExcelImportHubPage } from "./hooks/useExcelImportHubPage";
import ExcelHubBridgeSection from "./sections/ExcelHubBridgeSection";

export default function ExcelImportHubPage() {
  useExcelImportHubPage();
  return <ExcelHubBridgeSection />;
}

