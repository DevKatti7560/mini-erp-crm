import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

const Challans = () => {
  const navigate = useNavigate();

  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchChallans = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (status) {
        params.append("status", status);
      }

      params.append("limit", "100");

      const response = await api.get(
        `/challans?${params.toString()}`
      );

      setChallans(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load challans"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChallans();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status]);

  return (
    <div className="module-page">
      <div className="page-toolbar">
        <div>
          <h2>Sales Challans</h2>

          <p>
            Create and manage customer sales
            challans
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/challans/create")
          }
        >
          + Create Challan
        </button>
      </div>

      <div className="filter-card">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search challan number or customer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="">
            All Statuses
          </option>

          <option value="DRAFT">
            Draft
          </option>

          <option value="CONFIRMED">
            Confirmed
          </option>

          <option value="CANCELLED">
            Cancelled
          </option>
        </select>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <div>
            <h3>Challan Register</h3>

            <p>
              {challans.length} challan
              {challans.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading challans...
          </div>
        ) : challans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              ▥
            </div>

            <h3>No challans found</h3>

            <p>
              Create your first sales challan.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Challan</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {challans.map((challan) => (
                  <tr
                    key={challan.id}
                    className="clickable-row"
                    onClick={() =>
                      navigate(
                        `/challans/${challan.id}`
                      )
                    }
                  >
                    <td>
                      <strong className="challan-number">
                        {challan.challanNumber}
                      </strong>
                    </td>

                    <td>
                      <div>
                        <strong>
                          {challan.customer
                            ?.businessName ||
                            challan.customer?.name}
                        </strong>

                        <span className="muted-text">
                          {challan.customer?.mobile}
                        </span>
                      </div>
                    </td>

                    <td>
                      {challan.items?.length || 0}
                    </td>

                    <td>
                      <strong>
                        {challan.totalQuantity}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${challan.status.toLowerCase()}`}
                      >
                        {challan.status}
                      </span>
                    </td>

                    <td>
                      {challan.createdBy?.name ||
                        "—"}
                    </td>

                    <td>
                      {new Date(
                        challan.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Challans;