export const ROLES = {
  ADMIN: "ADMIN",
  SALES: "SALES",
  WAREHOUSE: "WAREHOUSE",
  ACCOUNTS: "ACCOUNTS",
};

export const canManageProducts = (role) => {
  return [
    ROLES.ADMIN,
    ROLES.WAREHOUSE,
  ].includes(role);
};

export const canManageInventory = (role) => {
  return [
    ROLES.ADMIN,
    ROLES.WAREHOUSE,
  ].includes(role);
};

export const canManageCustomers = (role) => {
  return [
    ROLES.ADMIN,
    ROLES.SALES,
  ].includes(role);
};

export const canCreateChallan = (role) => {
  return [
    ROLES.ADMIN,
    ROLES.SALES,
  ].includes(role);
};