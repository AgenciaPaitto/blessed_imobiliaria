/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import PropertyDetails from "./pages/PropertyDetails";
import SavedProperties from "./pages/SavedProperties";
import Login from "./pages/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import PropertiesConfig from "./pages/admin/PropertiesConfig";
import LeadsConfig from "./pages/admin/LeadsConfig";
import RootLayout from "./components/RootLayout";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/imoveis" element={<Catalog />} />
          <Route path="/imovel/:id" element={<PropertyDetails />} />
          <Route path="/salvos" element={<SavedProperties />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="imoveis" element={<PropertiesConfig />} />
          <Route path="leads" element={<LeadsConfig />} />
        </Route>
      </Routes>
    </Router>
  );
}
