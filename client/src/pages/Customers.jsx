import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

const Customers = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    customerType: "RETAIL",
    address: "",
    status: "LEAD",
    followUpDate: "",
    notes: "",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/customers?${params.toString()}`
      );

      setCustomers(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status]);

  const resetForm = () => {
    setForm({
      name: "",
      mobile: "",
      email: "",
      businessName: "",
      gstNumber: "",
      customerType: "RETAIL",
      address: "",
      status: "LEAD",
      followUpDate: "",
      notes: "",
    });
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      businessName: customer.businessName || "",
      gstNumber: customer.gstNumber || "",
      customerType:
        customer.customerType || "RETAIL",
      address: customer.address || "",
      status: customer.status || "LEAD",
      followUpDate: customer.followUpDate
        ? customer.followUpDate.split("T")[0]
        : "",
      notes: customer.notes || "",
    });

    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        await api.put(
          `/customers/${editingCustomer.id}`,
          form
        );

        toast.success(
          "Customer updated successfully"
        );
      } else {
        await api.post("/customers", form);

        toast.success(
          "Customer created successfully"
        );
      }

      setShowModal(false);
      resetForm();

      fetchCustomers();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Operation failed"
      );
    }
  };

  return (
    <div className="module-page">
      <div className="page-toolbar">
        <div>
          <h2>Customers</h2>
          <p>
            Manage your customer relationships and
            follow-ups
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddModal}
        >
          + Add Customer
        </button>
      </div>

      <div className="filter-card">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search by name, mobile or business..."
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
          <option value="">All Statuses</option>
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">
            Inactive
          </option>
        </select>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <div>
            <h3>Customer Directory</h3>

            <p>
              {customers.length} customer
              {customers.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◉</div>

            <h3>No customers found</h3>

            <p>
              Try changing your search or add a
              new customer.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Business</th>
                  <th>Mobile</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {customer.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {customer.name}
                          </strong>

                          <span>
                            {customer.email ||
                              "No email"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {customer.businessName}
                    </td>

                    <td>{customer.mobile}</td>

                    <td>
                      <span className="type-badge">
                        {customer.customerType}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${customer.status.toLowerCase()}`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td>
                      {customer.followUpDate
                        ? new Date(
                            customer.followUpDate
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-button"
                          title="View"
                          onClick={() =>
                            navigate(
                              `/customers/${customer.id}`
                            )
                          }
                        >
                          View
                        </button>

                        <button
                          className="icon-button"
                          title="Edit"
                          onClick={() =>
                            openEditModal(customer)
                          }
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowModal(false)
          }
        >
          <div
            className="modal-card customer-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h3>
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h3>

                <p>
                  Enter the customer's business
                  information
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>
            </div>

            <form
              className="modal-form"
              onSubmit={handleSubmit}
            >
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Customer Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Rajesh Kumar"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mobile *</label>

                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Business Name *
                  </label>

                  <input
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="Rajesh Traders"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>GST Number</label>

                  <input
                    name="gstNumber"
                    value={form.gstNumber}
                    onChange={handleChange}
                    placeholder="29ABCDE1234F1Z5"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Customer Type *
                  </label>

                  <select
                    name="customerType"
                    value={
                      form.customerType
                    }
                    onChange={handleChange}
                  >
                    <option value="RETAIL">
                      Retail
                    </option>

                    <option value="WHOLESALE">
                      Wholesale
                    </option>

                    <option value="DISTRIBUTOR">
                      Distributor
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="LEAD">
                      Lead
                    </option>

                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Follow-up Date
                  </label>

                  <input
                    type="date"
                    name="followUpDate"
                    value={
                      form.followUpDate
                    }
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Address *</label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Bangalore, Karnataka"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Additional customer notes..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingCustomer
                    ? "Update Customer"
                    : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;