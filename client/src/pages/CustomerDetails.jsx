import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showFollowUp, setShowFollowUp] =
    useState(false);

  const [followUpForm, setFollowUpForm] = useState({
    note: "",
    followUpDate: "",
  });

  const fetchCustomer = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/customers/${id}`
      );

      setCustomer(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load customer"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleFollowUpChange = (e) => {
    setFollowUpForm({
      ...followUpForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();

    if (!followUpForm.note.trim()) {
      toast.error("Please enter a follow-up note");
      return;
    }

    try {
      await api.post(
        `/customers/${id}/followups`,
        followUpForm
      );

      toast.success(
        "Follow-up added successfully"
      );

      setFollowUpForm({
        note: "",
        followUpDate: "",
      });

      setShowFollowUp(false);

      fetchCustomer();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to add follow-up"
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        Loading customer...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="empty-state">
        <h3>Customer not found</h3>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/customers")
          }
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="module-page">
      {/* Back */}
      <button
        className="back-button"
        onClick={() =>
          navigate("/customers")
        }
      >
        ← Back to Customers
      </button>

      {/* Profile Header */}
      <div className="customer-profile-card">
        <div className="customer-profile-main">
          <div className="customer-large-avatar">
            {customer.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <div className="profile-title-row">
              <h2>{customer.name}</h2>

              <span
                className={`status-badge ${customer.status.toLowerCase()}`}
              >
                {customer.status}
              </span>
            </div>

            <p>
              {customer.businessName}
            </p>

            <span className="profile-meta">
              {customer.customerType}
            </span>
          </div>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowFollowUp(true)
          }
        >
          + Add Follow-up
        </button>
      </div>

      {/* Information Grid */}
      <div className="details-grid">
        <div className="details-card">
          <div className="details-card-header">
            <h3>Contact Information</h3>
          </div>

          <div className="details-content">
            <div className="detail-item">
              <span>Mobile</span>
              <strong>
                {customer.mobile}
              </strong>
            </div>

            <div className="detail-item">
              <span>Email</span>
              <strong>
                {customer.email || "Not provided"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Address</span>
              <strong>
                {customer.address}
              </strong>
            </div>
          </div>
        </div>

        <div className="details-card">
          <div className="details-card-header">
            <h3>Business Information</h3>
          </div>

          <div className="details-content">
            <div className="detail-item">
              <span>Business Name</span>
              <strong>
                {customer.businessName}
              </strong>
            </div>

            <div className="detail-item">
              <span>GST Number</span>
              <strong>
                {customer.gstNumber ||
                  "Not provided"}
              </strong>
            </div>

            <div className="detail-item">
              <span>Customer Type</span>
              <strong>
                {customer.customerType}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="details-card notes-card">
        <div className="details-card-header">
          <h3>Customer Notes</h3>
        </div>

        <div className="details-content">
          <p className="customer-notes">
            {customer.notes ||
              "No notes available."}
          </p>
        </div>
      </div>

      {/* Follow-up */}
      <div className="details-card">
        <div className="details-card-header followup-header">
          <div>
            <h3>Follow-up History</h3>

            <p>
              Customer communication and follow-up
              records
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              setShowFollowUp(true)
            }
          >
            + Add Note
          </button>
        </div>

        {customer.followUps?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              ✓
            </div>

            <h3>No follow-ups yet</h3>

            <p>
              Add a follow-up note to keep track
              of customer communication.
            </p>
          </div>
        ) : (
          <div className="timeline">
            {customer.followUps.map(
              (followUp) => (
                <div
                  className="timeline-item"
                  key={followUp.id}
                >
                  <div className="timeline-dot">
                    ✓
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-top">
                      <strong>
                        {followUp.user?.name ||
                          "User"}
                      </strong>

                      <span>
                        {new Date(
                          followUp.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <p>{followUp.note}</p>

                    {followUp.followUpDate && (
                      <span className="next-followup">
                        Next follow-up:{" "}
                        {new Date(
                          followUp.followUpDate
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Challan History */}
      <div className="details-card">
        <div className="details-card-header">
          <div>
            <h3>Challan History</h3>

            <p>
              Sales challans associated with this
              customer
            </p>
          </div>
        </div>

        {customer.challans?.length === 0 ? (
          <div className="empty-state">
            No challans found for this customer.
          </div>
        ) : (
          <div className="simple-table">
            {customer.challans.map(
              (challan) => (
                <div
                  className="table-row"
                  key={challan.id}
                >
                  <div>
                    <strong>
                      {challan.challanNumber}
                    </strong>

                    <span>
                      {new Date(
                        challan.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`status-badge ${challan.status.toLowerCase()}`}
                  >
                    {challan.status}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Follow-up Modal */}
      {showFollowUp && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowFollowUp(false)
          }
        >
          <div
            className="modal-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h3>Add Follow-up</h3>

                <p>
                  Record a customer interaction
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowFollowUp(false)
                }
              >
                ×
              </button>
            </div>

            <form
              className="modal-form"
              onSubmit={handleFollowUpSubmit}
            >
              <div className="form-group">
                <label>Follow-up Note *</label>

                <textarea
                  name="note"
                  value={followUpForm.note}
                  onChange={
                    handleFollowUpChange
                  }
                  placeholder="What happened during the follow-up?"
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label>Next Follow-up Date</label>

                <input
                  type="date"
                  name="followUpDate"
                  value={
                    followUpForm.followUpDate
                  }
                  onChange={
                    handleFollowUpChange
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowFollowUp(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;