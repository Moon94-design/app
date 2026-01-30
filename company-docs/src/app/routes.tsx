import { Routes, Route, Navigate } from "react-router-dom";
import Shell from "./shell/Shell";

import HomeMain from "./pages/home/HomeMain";

import RegisterHome from "./pages/register/RegisterHome";
import RegisterMaster from "./pages/register/RegisterMaster";
import RegisterDaily from "./pages/register/RegisterDaily";
import RegisterPartner from "./pages/register/RegisterPartner";
import RegisterVehicle from "./pages/register/RegisterVehicle";
import RegisterVendor from "./pages/register/RegisterVendor";
import RegisterAgency from "./pages/register/RegisterAgency";
import RegisterEmployee from "./pages/register/RegisterEmployee";
import RegisterEquipment from "./pages/register/RegisterEquipment";
import RegisterConsumable from "./pages/register/RegisterConsumable";
import RegisterLogisticsDaily from "./pages/register/RegisterLogisticsDaily";
import RegisterOfficeDaily from "./pages/register/RegisterOfficeDaily";
import RegisterProductionDaily from "./pages/register/RegisterProductionDaily";

import ManageHome from "./pages/manage/ManageHome";
import ManageMaster from "./pages/manage/ManageMaster";
import ManageDaily from "./pages/manage/ManageDaily";

import BrowseHome from "./pages/browse/BrowseHome";
import BrowseMaster from "./pages/browse/BrowseMaster";
import BrowseDaily from "./pages/browse/BrowseDaily";
import BrowsePrice from "./pages/browse/BrowsePrice";

export default function AppRoutes() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomeMain />} />

        <Route path="/register" element={<RegisterHome />} />
        <Route path="/register/master" element={<RegisterMaster />} />
        <Route path="/register/daily" element={<RegisterDaily />} />

        {/* 기준정보 등록 */}
        <Route path="/register/master/partner" element={<RegisterPartner />} />
        <Route path="/register/master/vehicle" element={<RegisterVehicle />} />
        <Route path="/register/master/vendor" element={<RegisterVendor />} />
        <Route path="/register/master/agency" element={<RegisterAgency />} />
        <Route path="/register/master/employee" element={<RegisterEmployee />} />
        <Route path="/register/master/equipment" element={<RegisterEquipment />} />
        <Route path="/register/master/consumable" element={<RegisterConsumable />} />

        {/* 일일기록 등록 */}
        <Route path="/register/daily/logistics" element={<RegisterLogisticsDaily />} />
        <Route path="/register/daily/office" element={<RegisterOfficeDaily />} />
        <Route path="/register/daily/production" element={<RegisterProductionDaily />} />

        <Route path="/manage" element={<ManageHome />} />
        <Route path="/manage/master" element={<ManageMaster />} />
        <Route path="/manage/daily" element={<ManageDaily />} />

        <Route path="/browse" element={<BrowseHome />} />
        <Route path="/browse/master" element={<BrowseMaster />} />
        <Route path="/browse/daily" element={<BrowseDaily />} />
        <Route path="/browse/price" element={<BrowsePrice />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
