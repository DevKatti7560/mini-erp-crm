import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import api from "../services/api";

const Inventory = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  const fetchMovements = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/products/movements"
      );

      setMovements(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load inventory movements"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const productName =
        movement.product?.name || "";

      const sku =
        movement.product?.sku || "";

      const reason =
        movement.reason || "";

      const searchText =
        `${productName} ${sku} ${reason}`.toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      const matchesType =
        !type || movement.type === type;

      return (
        matchesSearch &&
        matchesType
      );
    });
  }, [movements, search, type]);

  const totalIn = useMemo(() => {
    return movements
      .filter(
        (movement) =>
          movement.type === "IN"
      )
      .reduce(
        (sum, movement) =>
          sum + Number(movement.quantity),
        0
      );
  }, [movements]);

  const totalOut = useMemo(() => {
    return movements
      .filter(
        (movement) =>
          movement.type === "OUT"
      )
      .reduce(
        (sum, movement) =>
          sum + Number(movement.quantity),
        0
      );
  }, [movements]);

  return (
    <div className="module-page">

      {/* Header */}
      <div className="page-toolbar">
        <div>
          <h2>Inventory</h2>

          <p>
            Track all stock movements and
            inventory activity
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={fetchMovements}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="inventory-summary">

        <div className="inventory-stat-card">
          <div className="inventory-stat-icon">
            #
          </div>

          <div>
            <span>
              Total Movements
            </span>

            <strong>
              {movements.length}
            </strong>
          </div>
        </div>

        <div className="inventory-stat-card">
          <div className="inventory-stat-icon in">
            ↑
          </div>

          <div>
            <span>
              Stock IN
            </span>

            <strong>
              {totalIn}
            </strong>

            <small>
              units received
            </small>
          </div>
        </div>

        <div className="inventory-stat-card">
          <div className="inventory-stat-icon out">
            ↓
          </div>

          <div>
            <span>
              Stock OUT
            </span>

            <strong>
              {totalOut}
            </strong>

            <small>
              units issued
            </small>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="filter-card">

        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search product, SKU or reason..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
        >
          <option value="">
            All Movements
          </option>

          <option value="IN">
            Stock IN
          </option>

          <option value="OUT">
            Stock OUT
          </option>
        </select>

      </div>

      {/* Movement Table */}
      <div className="data-card">

        <div className="data-card-header">
          <div>
            <h3>
              Stock Movement History
            </h3>

            <p>
              {filteredMovements.length} movement
              {filteredMovements.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading inventory movements...
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              ↕
            </div>

            <h3>
              No movements found
            </h3>

            <p>
              Stock IN and OUT activities will
              appear here.
            </p>

          </div>
        ) : (
          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>
                    Product
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Movement
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Reason
                  </th>

                  <th>
                    Created By
                  </th>

                  <th>
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredMovements.map(
                  (movement) => (

                    <tr
                      key={movement.id}
                    >

                      <td>
                        <div className="product-cell">

                          <div className="product-icon">
                            □
                          </div>

                          <div>
                            <strong>
                              {
                                movement
                                  .product
                                  ?.name
                              }
                            </strong>

                            <span>
                              Inventory movement
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="sku-text">
                          {
                            movement
                              .product
                              ?.sku
                          }
                        </span>
                      </td>

                      <td>

                        <span
                          className={`movement-badge ${movement.type.toLowerCase()}`}
                        >
                          {movement.type ===
                          "IN"
                            ? "↑ IN"
                            : "↓ OUT"}
                        </span>

                      </td>

                      <td>

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
                          {movement.quantity}
                        </strong>

                      </td>

                      <td>
                        <span className="reason-text">
                          {movement.reason ||
                            "—"}
                        </span>
                      </td>

                      <td>

                        <div className="creator-cell">

                          <div className="creator-avatar">
                            {movement
                              .creator
                              ?.name
                              ?.charAt(0)
                              .toUpperCase() ||
                              "U"}
                          </div>

                          <div>
                            <strong>
                              {
                                movement
                                  .creator
                                  ?.name
                              }
                            </strong>

                            <span>
                              {
                                movement
                                  .creator
                                  ?.role
                              }
                            </span>
                          </div>

                        </div>

                      </td>

                      <td>
                        <div className="date-cell">

                          <strong>
                            {new Date(
                              movement.createdAt
                            ).toLocaleDateString()}
                          </strong>

                          <span>
                            {new Date(
                              movement.createdAt
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )}
                          </span>

                        </div>
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default Inventory;