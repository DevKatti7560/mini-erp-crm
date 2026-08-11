import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

const ChallanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challan, setChallan] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const fetchChallan = async () => {
    try {
      const response = await api.get(
        `/challans/${id}`
      );

      setChallan(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load challan"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const confirmChallan = async () => {
    try {
      setActionLoading(true);

      await api.post(
        `/challans/${id}/confirm`
      );

      toast.success(
        "Challan confirmed successfully"
      );

      fetchChallan();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to confirm challan"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const cancelChallan = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this challan?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      await api.post(
        `/challans/${id}/cancel`
      );

      toast.success(
        "Challan cancelled successfully"
      );

      fetchChallan();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to cancel challan"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        Loading challan...
      </div>
    );
  }

  if (!challan) {
    return (
      <div className="empty-state">
        <h3>Challan not found</h3>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/challans")
          }
        >
          Back to Challans
        </button>
      </div>
    );
  }

  return (
    <div className="module-page">
      <button
        className="back-button"
        onClick={() =>
          navigate("/challans")
        }
      >
        ← Back to Challans
      </button>

      <div className="challan-header-card">
        <div>
          <div className="challan-title-row">
            <h2>
              {challan.challanNumber}
            </h2>

            <span
              className={`status-badge ${challan.status.toLowerCase()}`}
            >
              {challan.status}
            </span>
          </div>

          <p>
            Created on{" "}
            {new Date(
              challan.createdAt
            ).toLocaleString()}
          </p>
        </div>

        {challan.status === "DRAFT" && (
          <div className="challan-actions">
            <button
              className="secondary-button"
              disabled={actionLoading}
              onClick={cancelChallan}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              disabled={actionLoading}
              onClick={confirmChallan}
            >
              {actionLoading
                ? "Processing..."
                : "Confirm Challan"}
            </button>
          </div>
        )}
      </div>

      <div className="details-grid">
        <div className="details-card">
          <div className="details-card-header">
            <h3>
              Customer
            </h3>
          </div>

          <div className="details-content">
            <div className="detail-item">
              <span>
                Customer Name
              </span>

              <strong>
                {challan.customer
                  ?.name}
              </strong>
            </div>

            <div className="detail-item">
              <span>
                Business
              </span>

              <strong>
                {challan.customer
                  ?.businessName}
              </strong>
            </div>

            <div className="detail-item">
              <span>
                Mobile
              </span>

              <strong>
                {challan.customer
                  ?.mobile}
              </strong>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="details-card-header">
            <h3>
              Challan Information
            </h3>
          </div>

          <div className="details-content">
            <div className="detail-item">
              <span>
                Total Products
              </span>

              <strong>
                {challan.items
                  ?.length || 0}
              </strong>
            </div>

            <div className="detail-item">
              <span>
                Total Quantity
              </span>

              <strong>
                {challan.totalQuantity}
              </strong>
            </div>

            <div className="detail-item">
              <span>
                Created By
              </span>

              <strong>
                {challan.createdBy
                  ?.name}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="details-card">
        <div className="details-card-header">
          <div>
            <h3>
              Products
            </h3>

            <p>
              Product snapshot at the time
              of challan creation
            </p>
          </div>
        </div>

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
                  Unit Price
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {challan.items?.map(
                (item) => (
                  <tr
                    key={item.id}
                  >
                    <td>
                      <strong>
                        {
                          item.productName
                        }
                      </strong>
                    </td>

                    <td>
                      {item.sku}
                    </td>

                    <td>
                      ₹
                      {Number(
                        item.unitPrice
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      <strong>
                        ₹
                        {Number(
                          item.total
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="challan-total-footer">
          <span>
            Total Quantity
          </span>

          <strong>
            {challan.totalQuantity}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default ChallanDetails;