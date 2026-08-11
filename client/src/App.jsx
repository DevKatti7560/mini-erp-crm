import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Products from "./pages/Products";
import Challans from "./pages/Challans";
import CreateChallan from "./pages/CreateChallan";
import ChallanDetails from "./pages/ChallanDetails";
import Inventory from "./pages/Inventory";

import "./index.css";

const Layout = ({ children, title }) => {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header title={title} />

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <Layout title="Dashboard">
                  <Dashboard />
                </Layout>
              }
            />
            <Route
  path="/customers"
  element={
    <Layout title="Customers">
      <Customers />
    </Layout>
  }
/>
<Route
  path="/customers/:id"
  element={
    <Layout title="Customer Details">
      <CustomerDetails />
    </Layout>
  }
/>
<Route
  path="/products"
  element={
    <Layout title="Products">
      <Products />
    </Layout>
  }
/>
<Route
  path="/challans"
  element={
    <Layout title="Sales Challans">
      <Challans />
    </Layout>
  }
/>

<Route
  path="/challans/create"
  element={
    <Layout title="Create Challan">
      <CreateChallan />
    </Layout>
  }
/>

<Route
  path="/challans/:id"
  element={
    <Layout title="Challan Details">
      <ChallanDetails />
    </Layout>
  }
/>
<Route
  path="/inventory"
  element={
    <Layout title="Inventory">
      <Inventory />
    </Layout>
  }
/>
          </Route>

          {/* Default Route */}
          <Route
            path="*"
            element={<Login />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;