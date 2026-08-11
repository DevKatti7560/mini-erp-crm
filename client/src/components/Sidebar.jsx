import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  canManageProducts,
  canManageInventory,
  canManageCustomers,
  canCreateChallan,
} from "../utils/permissions";

const Sidebar = () => {
  const { user } = useAuth();

  const role = user?.role;

  return (
    <aside className="sidebar">

      {/* ================= BRAND ================= */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          ERP
        </div>

        <div>
          <h2>Mini ERP</h2>
          <span>CRM & Inventory</span>
        </div>
      </div>


      {/* ================= NAVIGATION ================= */}
      <nav className="sidebar-nav">

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="sidebar-icon">
            ▦
          </span>

          <span>
            Dashboard
          </span>
        </NavLink>


        {/* ================= CRM ================= */}
        {canManageCustomers(role) && (
          <div className="sidebar-section">

            <span className="sidebar-section-title">
              CRM
            </span>

            <NavLink
              to="/customers"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-icon">
                ◉
              </span>

              <span>
                Customers
              </span>
            </NavLink>

          </div>
        )}


        {/* ================= INVENTORY ================= */}
        {(canManageProducts(role) ||
          canManageInventory(role)) && (

          <div className="sidebar-section">

            <span className="sidebar-section-title">
              INVENTORY
            </span>


            {/* Products */}
            {canManageProducts(role) && (
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <span className="sidebar-icon">
                  □
                </span>

                <span>
                  Products
                </span>
              </NavLink>
            )}


            {/* Inventory */}
            {canManageInventory(role) && (
              <NavLink
                to="/inventory"
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <span className="sidebar-icon">
                  ↕
                </span>

                <span>
                  Inventory
                </span>
              </NavLink>
            )}

          </div>
        )}


        {/* ================= SALES ================= */}
        {canCreateChallan(role) && (

          <div className="sidebar-section">

            <span className="sidebar-section-title">
              SALES
            </span>

            <NavLink
              to="/challans"
              end={false}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span className="sidebar-icon">
                ▥
              </span>

              <span>
                Sales Challans
              </span>
            </NavLink>

          </div>
        )}

      </nav>


      {/* ================= USER PROFILE ================= */}
      <div className="sidebar-user">

        <div className="avatar">
          {user?.name
            ?.charAt(0)
            .toUpperCase()}
        </div>

        <div>
          <strong>
            {user?.name || "User"}
          </strong>

          <span>
            {user?.role || "Guest"}
          </span>
        </div>

      </div>

    </aside>
  );
};

export default Sidebar;