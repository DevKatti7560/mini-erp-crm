import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [challans, setChallans] = useState([]);
  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        customerResponse,
        productResponse,
        challanResponse,
        movementResponse,
      ] = await Promise.all([
        api.get("/customers?limit=100"),
        api.get("/products?limit=100"),
        api.get("/challans?limit=100"),
        api.get("/products/movements"),
      ]);

      setCustomers(
        customerResponse.data.data || []
      );

      setProducts(
        productResponse.data.data || []
      );

      setChallans(
        challanResponse.data.data || []
      );

      setMovements(
        movementResponse.data.data || []
      );
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalStock = useMemo(() => {
    return products.reduce(
      (sum, product) =>
        sum +
        Number(product.currentStock || 0),
      0
    );
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter(
      (product) =>
        Number(product.currentStock || 0) <=
        Number(product.minStock || 0)
    );
  }, [products]);

  const confirmedChallans = useMemo(() => {
    return challans.filter(
      (challan) =>
        challan.status === "CONFIRMED"
    );
  }, [challans]);

  const draftChallans = useMemo(() => {
    return challans.filter(
      (challan) =>
        challan.status === "DRAFT"
    );
  }, [challans]);

  const recentChallans = useMemo(() => {
    return [...challans]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [challans]);

  const recentMovements = useMemo(() => {
    return [...movements]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 6);
  }, [movements]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading business overview...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h2>
            Business Overview
          </h2>

          <p>
            Here's what's happening across
            your CRM, inventory and sales.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadDashboard}
        >
          ↻ Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-kpi-grid">

        {/* Customers */}
        <div
          className="dashboard-kpi-card"
          onClick={() =>
            navigate("/customers")
          }
        >
          <div className="kpi-top">
            <div className="kpi-icon customers">
              ◉
            </div>

            <span className="kpi-link">
              View →
            </span>
          </div>

          <span className="kpi-label">
            Total Customers
          </span>

          <strong className="kpi-value">
            {customers.length}
          </strong>

          <span className="kpi-description">
            Customer records
          </span>
        </div>

        {/* Products */}
        <div
          className="dashboard-kpi-card"
          onClick={() =>
            navigate("/products")
          }
        >
          <div className="kpi-top">
            <div className="kpi-icon products">
              □
            </div>

            <span className="kpi-link">
              View →
            </span>
          </div>

          <span className="kpi-label">
            Total Products
          </span>

          <strong className="kpi-value">
            {products.length}
          </strong>

          <span className="kpi-description">
            Active product catalog
          </span>
        </div>

        {/* Stock */}
        <div
          className="dashboard-kpi-card"
          onClick={() =>
            navigate("/inventory")
          }
        >
          <div className="kpi-top">
            <div className="kpi-icon stock">
              #
            </div>

            <span className="kpi-link">
              View →
            </span>
          </div>

          <span className="kpi-label">
            Total Stock
          </span>

          <strong className="kpi-value">
            {totalStock.toLocaleString(
              "en-IN"
            )}
          </strong>

          <span className="kpi-description">
            Units currently in inventory
          </span>
        </div>

        {/* Challans */}
        <div
          className="dashboard-kpi-card"
          onClick={() =>
            navigate("/challans")
          }
        >
          <div className="kpi-top">
            <div className="kpi-icon sales">
              ▥
            </div>

            <span className="kpi-link">
              View →
            </span>
          </div>

          <span className="kpi-label">
            Total Challans
          </span>

          <strong className="kpi-value">
            {challans.length}
          </strong>

          <span className="kpi-description">
            {confirmedChallans.length} confirmed ·{" "}
            {draftChallans.length} draft
          </span>
        </div>

      </div>

      {/* Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="dashboard-alert">

          <div className="alert-icon">
            !
          </div>

          <div className="alert-content">
            <strong>
              Low stock alert
            </strong>

            <p>
              {lowStockProducts.length}{" "}
              product
              {lowStockProducts.length !== 1
                ? "s are"
                : " is"}{" "}
              at or below the minimum stock
              level.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/products")
            }
          >
            Review Stock →
          </button>

        </div>
      )}

      {/* Main Grid */}
      <div className="dashboard-content-grid">

        {/* Recent Challans */}
        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h3>
                Recent Challans
              </h3>

              <p>
                Latest sales activity
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/challans")
              }
            >
              View All →
            </button>

          </div>

          {recentChallans.length === 0 ? (
            <div className="dashboard-empty">
              No challans available.
            </div>
          ) : (
            <div className="dashboard-list">

              {recentChallans.map(
                (challan) => (
                  <div
                    className="dashboard-list-row"
                    key={challan.id}
                    onClick={() =>
                      navigate(
                        `/challans/${challan.id}`
                      )
                    }
                  >

                    <div className="list-main">

                      <div className="list-icon challan">
                        ▥
                      </div>

                      <div>
                        <strong>
                          {
                            challan.challanNumber
                          }
                        </strong>

                        <span>
                          {challan.customer
                            ?.businessName ||
                            challan.customer
                              ?.name ||
                            "Unknown customer"}
                        </span>
                      </div>

                    </div>

                    <div className="list-right">

                      <span
                        className={`status-badge ${challan.status.toLowerCase()}`}
                      >
                        {challan.status}
                      </span>

                      <span className="list-date">
                        {new Date(
                          challan.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* Recent Stock Movements */}
        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h3>
                Recent Stock Movements
              </h3>

              <p>
                Latest inventory activity
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/inventory")
              }
            >
              View All →
            </button>

          </div>

          {recentMovements.length === 0 ? (
            <div className="dashboard-empty">
              No stock movements available.
            </div>
          ) : (
            <div className="dashboard-list">

              {recentMovements.map(
                (movement) => (
                  <div
                    className="dashboard-list-row"
                    key={movement.id}
                  >

                    <div className="list-main">

                      <div
                        className={`list-icon movement ${movement.type.toLowerCase()}`}
                      >
                        {movement.type ===
                        "IN"
                          ? "↑"
                          : "↓"}
                      </div>

                      <div>
                        <strong>
                          {
                            movement.product
                              ?.name
                          }
                        </strong>

                        <span>
                          {movement.reason ||
                            "Stock movement"}
                        </span>
                      </div>

                    </div>

                    <div className="list-right">

                      <strong
                        className={
                          movement.type ===
                          "IN"
                            ? "quantity-in"
                            : "quantity-out"
                        }
                      >
                        {movement.type ===
                        "IN"
                          ? "+"
                          : "-"}
                        {
                          movement.quantity
                        }
                      </strong>

                      <span className="list-date">
                        {new Date(
                          movement.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h3>
                Products Requiring Attention
              </h3>

              <p>
                Products at or below minimum
                stock
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/products")
              }
            >
              Manage Products →
            </button>

          </div>

          <div className="low-stock-grid">

            {lowStockProducts
              .slice(0, 6)
              .map((product) => (
                <div
                  className="low-stock-item"
                  key={product.id}
                >

                  <div className="product-cell">

                    <div className="product-icon">
                      □
                    </div>

                    <div>
                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {product.sku}
                      </span>
                    </div>

                  </div>

                  <div className="low-stock-values">

                    <div>
                      <span>
                        Current
                      </span>

                      <strong>
                        {
                          product.currentStock
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Minimum
                      </span>

                      <strong>
                        {product.minStock}
                      </strong>
                    </div>

                  </div>

                </div>
              ))}

          </div>

        </div>
      )}

    </div>
  );
};

export default Dashboard;