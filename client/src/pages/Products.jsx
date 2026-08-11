import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import { canManageProducts } from "../utils/permissions";

const Products = () => {
  // ================= AUTH / ROLE =================

  const { user } = useAuth();

  const role = user?.role;

  const canManage = canManageProducts(role);


  // ================= PRODUCT STATE =================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");


  // ================= PRODUCT MODAL =================

  const [showModal, setShowModal] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);


  // ================= STOCK MODAL =================

  const [showStockModal, setShowStockModal] =
    useState(false);

  const [stockAction, setStockAction] =
    useState("IN");

  const [selectedProduct, setSelectedProduct] =
    useState(null);


  // ================= PRODUCT FORM =================

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    currentStock: "",
    minStock: "",
    warehouse: "",
  });


  // ================= STOCK FORM =================

  const [stockForm, setStockForm] = useState({
    quantity: "",
    reason: "",
  });


  // ================= FETCH PRODUCTS =================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (category) {
        params.append("category", category);
      }

      params.append("limit", "100");

      const response = await api.get(
        `/products?${params.toString()}`
      );

      setProducts(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };


  // ================= LOAD PRODUCTS =================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category]);


  // ================= CATEGORIES =================

  const categories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];


  // ================= RESET FORM =================

  const resetForm = () => {
    setForm({
      name: "",
      sku: "",
      category: "",
      unitPrice: "",
      currentStock: "",
      minStock: "",
      warehouse: "",
    });
  };


  // ================= ADD PRODUCT =================

  const openAddModal = () => {
    if (!canManage) {
      toast.error(
        "You do not have permission to manage products"
      );

      return;
    }

    setEditingProduct(null);

    resetForm();

    setShowModal(true);
  };


  // ================= EDIT PRODUCT =================

  const openEditModal = (product) => {
    if (!canManage) {
      toast.error(
        "You do not have permission to edit products"
      );

      return;
    }

    setEditingProduct(product);

    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      unitPrice: product.unitPrice ?? "",
      currentStock:
        product.currentStock ?? "",
      minStock: product.minStock ?? "",
      warehouse: product.warehouse || "",
    });

    setShowModal(true);
  };


  // ================= PRODUCT FORM CHANGE =================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  // ================= PRODUCT SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canManage) {
      toast.error(
        "You do not have permission to manage products"
      );

      return;
    }

    try {
      if (editingProduct) {
        await api.put(
          `/products/${editingProduct.id}`,
          {
            name: form.name,
            category: form.category,
            unitPrice: Number(
              form.unitPrice
            ),
            minStock: Number(
              form.minStock
            ),
            warehouse: form.warehouse,
          }
        );

        toast.success(
          "Product updated successfully"
        );
      } else {
        await api.post("/products", {
          name: form.name,
          sku: form.sku,
          category: form.category,
          unitPrice: Number(
            form.unitPrice
          ),
          currentStock: Number(
            form.currentStock
          ),
          minStock: Number(
            form.minStock
          ),
          warehouse: form.warehouse,
        });

        toast.success(
          "Product created successfully"
        );
      }

      setShowModal(false);

      resetForm();

      fetchProducts();

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Operation failed"
      );
    }
  };


  // ================= OPEN STOCK MODAL =================

  const openStockModal = (
    product,
    action
  ) => {
    if (!canManage) {
      toast.error(
        "You do not have permission to manage inventory"
      );

      return;
    }

    setSelectedProduct(product);

    setStockAction(action);

    setStockForm({
      quantity: "",
      reason: "",
    });

    setShowStockModal(true);
  };


  // ================= STOCK FORM CHANGE =================

  const handleStockChange = (e) => {
    setStockForm({
      ...stockForm,
      [e.target.name]: e.target.value,
    });
  };


  // ================= STOCK SUBMIT =================

  const handleStockSubmit = async (e) => {
    e.preventDefault();

    if (!canManage) {
      toast.error(
        "You do not have permission to manage inventory"
      );

      return;
    }

    try {
      const endpoint =
        stockAction === "IN"
          ? `/products/${selectedProduct.id}/stock/in`
          : `/products/${selectedProduct.id}/stock/out`;

      const response = await api.post(
        endpoint,
        {
          quantity: Number(
            stockForm.quantity
          ),
          reason: stockForm.reason,
        }
      );

      console.log(
        "Stock response:",
        response.data
      );

      toast.success(
        stockAction === "IN"
          ? "Stock added successfully"
          : "Stock removed successfully"
      );

      setShowStockModal(false);

      fetchProducts();

    } catch (error) {
      console.error(
        "Stock operation error:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Stock operation failed";

      toast.error(message, {
        duration: 5000,
      });

      // Do NOT close modal on error
    }
  };


  // ================= UI =================

  return (
    <div className="module-page">

      {/* ================= TOOLBAR ================= */}

      <div className="page-toolbar">

        <div>
          <h2>Products</h2>

          <p>
            Manage products, pricing and inventory
            levels
          </p>
        </div>


        {/* Add Product */}
        {canManage && (
          <button
            className="primary-button"
            onClick={openAddModal}
          >
            + Add Product
          </button>
        )}

      </div>


      {/* ================= FILTERS ================= */}

      <div className="filter-card">

        <div className="search-box">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >
          <option value="">
            All Categories
          </option>

          {categories.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

      </div>


      {/* ================= PRODUCT TABLE ================= */}

      <div className="data-card">

        <div className="data-card-header">

          <div>

            <h3>Product Catalog</h3>

            <p>
              {products.length} product
              {products.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

        </div>


        {/* Loading */}

        {loading ? (

          <div className="loading-state">
            Loading products...
          </div>

        ) : products.length === 0 ? (

          /* Empty */

          <div className="empty-state">

            <div className="empty-icon">
              □
            </div>

            <h3>
              No products found
            </h3>

            <p>
              Add a product or change your
              search criteria.
            </p>

          </div>

        ) : (

          /* Table */

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock</th>
                  <th>Warehouse</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {products.map(
                  (product) => {

                    const isLowStock =
                      product.currentStock <=
                      product.minStock;

                    return (

                      <tr
                        key={product.id}
                      >

                        {/* Product */}

                        <td>

                          <div className="product-cell">

                            <div className="product-icon">
                              □
                            </div>

                            <div>

                              <strong>
                                {product.name}
                              </strong>

                              <span>
                                Min. stock:{" "}
                                {product.minStock}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* SKU */}

                        <td>

                          <span className="sku-text">
                            {product.sku}
                          </span>

                        </td>


                        {/* Category */}

                        <td>
                          {product.category}
                        </td>


                        {/* Price */}

                        <td>
                          ₹
                          {Number(
                            product.unitPrice
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>


                        {/* Stock */}

                        <td>

                          <div className="stock-cell">

                            <strong
                              className={
                                isLowStock
                                  ? "stock-danger"
                                  : ""
                              }
                            >
                              {
                                product.currentStock
                              }
                            </strong>

                            {isLowStock && (
                              <span className="low-stock-badge">
                                Low Stock
                              </span>
                            )}

                          </div>

                        </td>


                        {/* Warehouse */}

                        <td>
                          {product.warehouse}
                        </td>


                        {/* Actions */}

                        <td>

                          {canManage && (

                            <div className="action-buttons">

                              {/* Stock IN */}

                              <button
                                className="icon-button"
                                onClick={() =>
                                  openStockModal(
                                    product,
                                    "IN"
                                  )
                                }
                              >
                                + Stock
                              </button>


                              {/* Stock OUT */}

                              <button
                                className="icon-button danger-action"
                                onClick={() =>
                                  openStockModal(
                                    product,
                                    "OUT"
                                  )
                                }
                              >
                                − Stock
                              </button>


                              {/* Edit */}

                              <button
                                className="icon-button"
                                onClick={() =>
                                  openEditModal(
                                    product
                                  )
                                }
                              >
                                Edit
                              </button>

                            </div>

                          )}

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ================= ADD / EDIT MODAL ================= */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowModal(false)
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

                <h3>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h3>

                <p>
                  Manage product and inventory
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

                {/* Product Name */}

                <div className="form-group">

                  <label>
                    Product Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Wireless Keyboard"
                    required
                  />

                </div>


                {/* SKU */}

                <div className="form-group">

                  <label>
                    SKU *
                  </label>

                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="KB-WL-001"
                    disabled={
                      !!editingProduct
                    }
                    required
                  />

                </div>


                {/* Category */}

                <div className="form-group">

                  <label>
                    Category *
                  </label>

                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Computer Accessories"
                    required
                  />

                </div>


                {/* Unit Price */}

                <div className="form-group">

                  <label>
                    Unit Price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="unitPrice"
                    value={form.unitPrice}
                    onChange={handleChange}
                    placeholder="850"
                    required
                  />

                </div>


                {/* Initial Stock */}

                {!editingProduct && (

                  <div className="form-group">

                    <label>
                      Initial Stock *
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="currentStock"
                      value={
                        form.currentStock
                      }
                      onChange={handleChange}
                      placeholder="50"
                      required
                    />

                  </div>

                )}


                {/* Minimum Stock */}

                <div className="form-group">

                  <label>
                    Minimum Stock *
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="minStock"
                    value={form.minStock}
                    onChange={handleChange}
                    placeholder="10"
                    required
                  />

                </div>


                {/* Warehouse */}

                <div className="form-group full-width">

                  <label>
                    Warehouse *
                  </label>

                  <input
                    name="warehouse"
                    value={form.warehouse}
                    onChange={handleChange}
                    placeholder="Bangalore Warehouse"
                    required
                  />

                </div>

              </div>


              {/* Modal Actions */}

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


                {canManage && (
                  <button
                    type="submit"
                    className="primary-button"
                  >
                    {editingProduct
                      ? "Update Product"
                      : "Create Product"}
                  </button>
                )}

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ================= STOCK MODAL ================= */}

      {showStockModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowStockModal(false)
          }
        >

          <div
            className="modal-card stock-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h3>
                  {stockAction === "IN"
                    ? "Add Stock"
                    : "Remove Stock"}
                </h3>

                <p>
                  {selectedProduct?.name}
                </p>

              </div>


              <button
                className="modal-close"
                onClick={() =>
                  setShowStockModal(false)
                }
              >
                ×
              </button>

            </div>


            <form
              className="modal-form"
              onSubmit={handleStockSubmit}
            >

              {/* Current Stock */}

              <div className="current-stock-display">

                <span>
                  Current Stock
                </span>

                <strong>
                  {
                    selectedProduct?.currentStock
                  }
                </strong>

              </div>


              {/* Quantity */}

              <div className="form-group">

                <label>
                  Quantity *
                </label>

                <input
                  type="number"
                  min="1"
                  name="quantity"
                  value={
                    stockForm.quantity
                  }
                  onChange={
                    handleStockChange
                  }
                  placeholder="Enter quantity"
                  required
                />

              </div>


              {/* Reason */}

              <div className="form-group">

                <label>
                  Reason *
                </label>

                <textarea
                  name="reason"
                  value={
                    stockForm.reason
                  }
                  onChange={
                    handleStockChange
                  }
                  placeholder={
                    stockAction === "IN"
                      ? "New supplier delivery"
                      : "Damaged items"
                  }
                  rows="3"
                  required
                />

              </div>


              {/* Stock Modal Actions */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowStockModal(false)
                  }
                >
                  Cancel
                </button>


                {canManage && (
                  <button
                    type="submit"
                    className="primary-button"
                  >
                    {stockAction === "IN"
                      ? "Add Stock"
                      : "Remove Stock"}
                  </button>
                )}

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Products;

