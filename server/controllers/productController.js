const prisma = require("../config/prisma");

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      lowStock,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (category) {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limitNumber,
      }),

      prisma.product.count({
        where,
      }),
    ]);

    let filteredProducts = products;

    if (lowStock === "true") {
      filteredProducts = products.filter(
        (product) =>
          product.currentStock <= product.minStock
      );
    }

    res.json({
      success: true,
      data: filteredProducts,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        movements: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      unitPrice,
      currentStock,
      minStock,
      warehouse,
    } = req.body;

    if (
      !name ||
      !sku ||
      !category ||
      unitPrice === undefined ||
      currentStock === undefined ||
      minStock === undefined ||
      !warehouse
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, SKU, category, unit price, stock, minimum stock and warehouse are required",
      });
    }

    if (
      Number(unitPrice) < 0 ||
      Number(currentStock) < 0 ||
      Number(minStock) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price and stock values cannot be negative",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        unitPrice: Number(unitPrice),
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        warehouse,
        createdById: req.user.id,
      },
    });

    // Create initial stock movement
    if (Number(currentStock) > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: Number(currentStock),
          type: "IN",
          reason: "Initial stock",
          createdById: req.user.id,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      category,
      unitPrice,
      minStock,
      warehouse,
    } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(unitPrice !== undefined && {
          unitPrice: Number(unitPrice),
        }),
        ...(minStock !== undefined && {
          minStock: Number(minStock),
        }),
        ...(warehouse !== undefined && { warehouse }),
      },
    });

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// ADD STOCK
const addStock = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { quantity, reason } = req.body;

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const result = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: {
          currentStock: {
            increment: qty,
          },
        },
      }),

      prisma.stockMovement.create({
        data: {
          productId,
          quantity: qty,
          type: "IN",
          reason,
          createdById: req.user.id,
        },
      }),
    ]);

    res.json({
      success: true,
      message: "Stock added successfully",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add stock",
    });
  }
};

// REMOVE STOCK
const removeStock = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { quantity, reason } = req.body;

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.currentStock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available stock: ${product.currentStock}`,
      });
    }

    const result = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: {
          currentStock: {
            decrement: qty,
          },
        },
      }),

      prisma.stockMovement.create({
        data: {
          productId,
          quantity: qty,
          type: "OUT",
          reason,
          createdById: req.user.id,
        },
      }),
    ]);

    res.json({
      success: true,
      message: "Stock removed successfully",
      data: result[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to remove stock",
    });
  }
};

// GET STOCK MOVEMENTS
const getStockMovements = async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: movements,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock movements",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  addStock,
  removeStock,
  getStockMovements,
};