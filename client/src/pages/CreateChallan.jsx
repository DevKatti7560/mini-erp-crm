import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

const CreateChallan = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] =
    useState("");

  const [items, setItems] = useState([]);

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          customerResponse,
          productResponse,
        ] = await Promise.all([
          api.get("/customers?limit=100"),
          api.get("/products?limit=100"),
        ]);

        setCustomers(
          customerResponse.data.data
        );

        setProducts(
          productResponse.data.data
        );
      } catch (error) {
        toast.error(
          "Failed to load customers or products"
        );
      }
    };

    loadData();
  }, []);

  const addItem = () => {
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      toast.error(
        "Quantity must be greater than zero"
      );
      return;
    }

    const product = products.find(
      (item) =>
        item.id === Number(selectedProductId)
    );

    if (!product) {
      toast.error("Product not found");
      return;
    }

    const existingItem = items.find(
      (item) =>
        item.productId === product.id
    );

    if (existingItem) {
      toast.error(
        "Product already added. Update the quantity instead."
      );
      return;
    }

    if (qty > product.currentStock) {
      toast.error(
        `Only ${product.currentStock} units available`
      );
      return;
    }

    setItems([
      ...items,
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: Number(
          product.unitPrice
        ),
        currentStock:
          product.currentStock,
        quantity: qty,
      },
    ]);

    setSelectedProductId("");
    setQuantity("");
  };

  const updateQuantity = (
    productId,
    newQuantity
  ) => {
    const qty = Number(newQuantity);

    setItems(
      items.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        return {
          ...item,
          quantity:
            qty > 0 ? qty : 1,
        };
      })
    );
  };

  const removeItem = (productId) => {
    setItems(
      items.filter(
        (item) =>
          item.productId !== productId
      )
    );
  };

  const totalQuantity = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + Number(item.quantity),
      0
    );
  }, [items]);

  const totalValue = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity) *
          Number(item.unitPrice),
      0
    );
  }, [items]);

  const submitChallan = async (
    status
  ) => {
    if (!customerId) {
      toast.error(
        "Please select a customer"
      );
      return;
    }

    if (items.length === 0) {
      toast.error(
        "Add at least one product"
      );
      return;
    }

    // Validate quantities against current stock
    for (const item of items) {
      if (
        Number(item.quantity) >
        Number(item.currentStock)
      ) {
        toast.error(
          `${item.productName}: only ${item.currentStock} units available`
        );
        return;
      }
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/challans",
        {
          customerId: Number(customerId),

          items: items.map((item) => ({
            productId: item.productId,
            quantity: Number(
              item.quantity
            ),
          })),

          status,
        }
      );

      toast.success(
        status === "DRAFT"
          ? "Challan saved as draft"
          : "Challan confirmed successfully"
      );

      navigate(
        `/challans/${response.data.data.id}`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create challan"
      );
    } finally {
      setLoading(false);
    }
  };

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

      <div className="page-toolbar">
        <div>
          <h2>Create Sales Challan</h2>

          <p>
            Select a customer and add products
            to create a challan
          </p>
        </div>
      </div>

      <div className="challan-builder">
        {/* LEFT SIDE */}
        <div>
          {/* Customer */}
          <div className="builder-card">
            <div className="builder-card-header">
              <div className="step-number">
                1
              </div>

              <div>
                <h3>
                  Select Customer
                </h3>

                <p>
                  Choose the customer for this
                  challan
                </p>
              </div>
            </div>

            <div className="builder-card-body">
              <label>
                Customer *
              </label>

              <select
                className="large-select"
                value={customerId}
                onChange={(e) =>
                  setCustomerId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select customer
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.businessName ||
                        customer.name}{" "}
                      —{" "}
                      {customer.mobile}
                    </option>
                  )
                )}
              </select>

              {customerId && (
                <div className="selected-customer">
                  {(() => {
                    const customer =
                      customers.find(
                        (item) =>
                          item.id ===
                          Number(
                            customerId
                          )
                      );

                    return (
                      <>
                        <div className="customer-avatar">
                          {customer?.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {customer?.name}
                          </strong>

                          <span>
                            {
                              customer?.businessName
                            }
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="builder-card">
            <div className="builder-card-header">
              <div className="step-number">
                2
              </div>

              <div>
                <h3>
                  Add Products
                </h3>

                <p>
                  Select products and quantities
                </p>
              </div>
            </div>

            <div className="builder-card-body">
              <div className="product-add-row">
                <div>
                  <label>
                    Product
                  </label>

                  <select
                    className="large-select"
                    value={
                      selectedProductId
                    }
                    onChange={(e) =>
                      setSelectedProductId(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select product
                    </option>

                    {products.map(
                      (product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name} —{" "}
                          {product.sku} —{" "}
                          Stock:{" "}
                          {
                            product.currentStock
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="quantity-input">
                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        e.target.value
                      )
                    }
                    placeholder="Qty"
                  />
                </div>

                <button
                  className="primary-button add-product-button"
                  onClick={addItem}
                >
                  + Add
                </button>
              </div>

              {items.length === 0 ? (
                <div className="items-empty">
                  <div className="empty-icon">
                    □
                  </div>

                  <p>
                    No products added yet
                  </p>
                </div>
              ) : (
                <div className="challan-items">
                  {items.map((item) => (
                    <div
                      className="challan-item"
                      key={item.productId}
                    >
                      <div className="challan-item-info">
                        <div className="product-icon">
                          □
                        </div>

                        <div>
                          <strong>
                            {
                              item.productName
                            }
                          </strong>

                          <span>
                            {item.sku}
                          </span>
                        </div>
                      </div>

                      <div className="item-price">
                        ₹
                        {Number(
                          item.unitPrice
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </div>

                      <div className="item-quantity">
                        <input
                          type="number"
                          min="1"
                          value={
                            item.quantity
                          }
                          onChange={(e) =>
                            updateQuantity(
                              item.productId,
                              e.target.value
                            )
                          }
                        />

                        <span>
                          /{" "}
                          {
                            item.currentStock
                          }{" "}
                          available
                        </span>
                      </div>

                      <div className="item-total">
                        ₹
                        {(
                          Number(
                            item.quantity
                          ) *
                          Number(
                            item.unitPrice
                          )
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </div>

                      <button
                        className="remove-item-button"
                        onClick={() =>
                          removeItem(
                            item.productId
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="challan-summary">
          <div className="summary-card">
            <div className="summary-header">
              <h3>
                Challan Summary
              </h3>

              <span>
                DRAFT
              </span>
            </div>

            <div className="summary-body">
              <div className="summary-row">
                <span>
                  Customer
                </span>

                <strong>
                  {customerId
                    ? customers.find(
                        (customer) =>
                          customer.id ===
                          Number(
                            customerId
                          )
                      )?.businessName ||
                      customers.find(
                        (customer) =>
                          customer.id ===
                          Number(
                            customerId
                          )
                      )?.name
                    : "Not selected"}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Products
                </span>

                <strong>
                  {items.length}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Total Quantity
                </span>

                <strong>
                  {totalQuantity}
                </strong>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>
                  Total Value
                </span>

                <strong>
                  ₹
                  {totalValue.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div className="summary-note">
                <span>ⓘ</span>

                <p>
                  Stock is reduced only when
                  the challan is confirmed.
                </p>
              </div>

              <button
                className="secondary-button full-button"
                disabled={loading}
                onClick={() =>
                  submitChallan(
                    "DRAFT"
                  )
                }
              >
                {loading
                  ? "Saving..."
                  : "Save as Draft"}
              </button>

              <button
                className="primary-button full-button"
                disabled={loading}
                onClick={() =>
                  submitChallan(
                    "CONFIRMED"
                  )
                }
              >
                {loading
                  ? "Processing..."
                  : "Confirm Challan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChallan;