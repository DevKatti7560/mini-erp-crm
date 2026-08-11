const prisma = require("../config/prisma");

// Generate challan number
const generateChallanNumber = async () => {
  const lastChallan = await prisma.challan.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  const nextNumber = lastChallan
    ? lastChallan.id + 1
    : 1;

  return `CH-${String(nextNumber).padStart(6, "0")}`;
};

// GET ALL CHALLANS
const getChallans = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        {
          challanNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customer: {
            businessName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          customer: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              businessName: true,
              mobile: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limitNumber,
      }),

      prisma.challan.count({
        where,
      }),
    ]);

    res.json({
      success: true,
      data: challans,
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
      message: "Failed to fetch challans",
    });
  }
};

// GET CHALLAN BY ID
const getChallanById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,

        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                currentStock: true,
              },
            },
          },
        },
      },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    res.json({
      success: true,
      data: challan,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch challan",
    });
  }
};

// CREATE CHALLAN
const createChallan = async (req, res) => {
  try {
    const {
      customerId,
      items,
      status = "DRAFT",
    } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product is required",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: Number(customerId),
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Validate products
    const productIds = items.map((item) =>
      Number(item.productId)
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products were not found",
      });
    }

    const productMap = new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    );

    let totalQuantity = 0;

    const challanItems = items.map((item) => {
      const product = productMap.get(
        Number(item.productId)
      );

      const quantity = Number(item.quantity);

      if (!quantity || quantity <= 0) {
        throw new Error(
          `Invalid quantity for ${product.name}`
        );
      }

      totalQuantity += quantity;

      return {
        productId: product.id,

        // Product snapshot
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,

        quantity,
        total: product.unitPrice * quantity,
      };
    });

    // If creating directly as CONFIRMED,
    // validate stock before making changes.
    if (status.toUpperCase() === "CONFIRMED") {
      for (const item of challanItems) {
        const product = productMap.get(item.productId);

        if (product.currentStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Required: ${item.quantity}`,
          });
        }
      }
    }

    const challanNumber =
      await generateChallanNumber();

    const result = await prisma.$transaction(
      async (tx) => {
        const challan = await tx.challan.create({
          data: {
            challanNumber,
            customerId: Number(customerId),
            totalQuantity,
            status: status.toUpperCase(),
            createdById: req.user.id,

            items: {
              create: challanItems,
            },
          },

          include: {
            customer: true,
            items: true,
          },
        });

        // Reduce stock only if confirmed
        if (status.toUpperCase() === "CONFIRMED") {
          for (const item of challanItems) {
            await tx.product.update({
              where: {
                id: item.productId,
              },

              data: {
                currentStock: {
                  decrement: item.quantity,
                },
              },
            });

            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                quantity: item.quantity,
                type: "OUT",
                reason: `Sales Challan ${challanNumber}`,
                createdById: req.user.id,
              },
            });
          }
        }

        return challan;
      },
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    res.status(201).json({
      success: true,
      message: `Challan ${status.toLowerCase()} successfully`,
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to create challan",
    });
  }
};

// CONFIRM CHALLAN
const confirmChallan = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await prisma.$transaction(
      async (tx) => {
        // Get challan
        const challan = await tx.challan.findUnique({
          where: { id },
          include: {
            items: true,
          },
        });

        if (!challan) {
          throw new Error("Challan not found");
        }

        // Only DRAFT challans can be confirmed
        if (challan.status !== "DRAFT") {
          throw new Error(
            `Only draft challans can be confirmed. Current status: ${challan.status}`
          );
        }

        // Get current products
        const productIds = challan.items.map(
          (item) => item.productId
        );

        const products = await tx.product.findMany({
          where: {
            id: {
              in: productIds,
            },
          },
        });

        const productMap = new Map(
          products.map((product) => [
            product.id,
            product,
          ])
        );

        // Check ALL stock before changing anything
        for (const item of challan.items) {
          const product = productMap.get(
            item.productId
          );

          if (!product) {
            throw new Error(
              `Product ${item.productName} no longer exists`
            );
          }

          if (product.currentStock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Required: ${item.quantity}`
            );
          }
        }

        // Reduce stock
        for (const item of challan.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },

            data: {
              currentStock: {
                decrement: item.quantity,
              },
            },
          });

          // Create OUT stock movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: "OUT",
              reason: `Sales Challan ${challan.challanNumber}`,
              createdById: req.user.id,
            },
          });
        }

        // Mark challan as CONFIRMED
        return tx.challan.update({
          where: { id },

          data: {
            status: "CONFIRMED",
          },

          include: {
            customer: true,
            items: true,
          },
        });
      },

      // Transaction options
      {
        maxWait: 10000,
        timeout: 20000,
      }
    );

    res.json({
      success: true,
      message: "Challan confirmed successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// CANCEL CHALLAN
const cancelChallan = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const challan = await prisma.challan.findUnique({
      where: { id },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (challan.status === "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message:
          "Confirmed challans cannot be cancelled",
      });
    }

    if (challan.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Challan is already cancelled",
      });
    }

    const updatedChallan =
      await prisma.challan.update({
        where: { id },

        data: {
          status: "CANCELLED",
        },
      });

    res.json({
      success: true,
      message: "Challan cancelled successfully",
      data: updatedChallan,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel challan",
    });
  }
};

module.exports = {
  getChallans,
  getChallanById,
  createChallan,
  confirmChallan,
  cancelChallan,
};