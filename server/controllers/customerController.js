const prisma = require("../config/prisma");

// GET ALL CUSTOMERS
const getCustomers = async (req, res) => {
  try {
    const { search, status, type, page = 1, limit = 10 } = req.query;

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
          mobile: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          businessName: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (type) {
      where.customerType = type.toUpperCase();
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limitNumber,
      }),

      prisma.customer.count({
        where,
      }),
    ]);

    res.json({
      success: true,
      data: customers,
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
      message: "Failed to fetch customers",
    });
  }
};

// GET CUSTOMER BY ID
const getCustomerById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          include: {
            user: {
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
        challans: {
          select: {
            id: true,
            challanNumber: true,
            status: true,
            totalQuantity: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

// CREATE CUSTOMER
const createCustomer = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    if (
      !name ||
      !mobile ||
      !businessName ||
      !customerType ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, mobile, business name, customer type and address are required",
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber,
        customerType: customerType.toUpperCase(),
        address,
        status: status
          ? status.toUpperCase()
          : "LEAD",
        followUpDate: followUpDate
          ? new Date(followUpDate)
          : null,
        notes,
        createdById: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

// UPDATE CUSTOMER
const updateCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingCustomer =
      await prisma.customer.findUnique({
        where: { id },
      });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(mobile !== undefined && { mobile }),
        ...(email !== undefined && { email }),
        ...(businessName !== undefined && { businessName }),
        ...(gstNumber !== undefined && { gstNumber }),
        ...(customerType !== undefined && {
          customerType: customerType.toUpperCase(),
        }),
        ...(address !== undefined && { address }),
        ...(status !== undefined && {
          status: status.toUpperCase(),
        }),
        ...(followUpDate !== undefined && {
          followUpDate: followUpDate
            ? new Date(followUpDate)
            : null,
        }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};

// ADD FOLLOW-UP
const addFollowUp = async (req, res) => {
  try {
    const customerId = Number(req.params.id);

    const { note, followUpDate } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Follow-up note is required",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const followUp = await prisma.followUp.create({
      data: {
        customerId,
        userId: req.user.id,
        note,
        followUpDate: followUpDate
          ? new Date(followUpDate)
          : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Follow-up added successfully",
      data: followUp,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add follow-up",
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addFollowUp,
};