const tenantRouters = require('./tenantRouters');
const refresh = require('./auth/refresh');
const logout = require('./auth/logout');
const authRouters = require('./auth/authRouters');
const userRouters = require('./userRouters');
const RegisterAsTenant = require('./registerAsTenantRouter');
const tenantTransactionRouter = require('./transactionTenantRouters');
const pagesRouters = require('./pagesRouters');
const roomsRouters = require('./roomsRouters');
const transactionRouters = require('./transaction/transactionRouters');
const privateTransactionRouters = require('./transaction/privateTransactionRouters');
const propertyRouters = require('./property/propertyRouters');
const paymentRouters = require('./transaction/paymentRouters');
const paymentMethodRouter = require('./transaction/paymentMethodRouter');

module.exports = {
  userRouters,
  tenantRouters,
  refresh,
  logout,
  authRouters,
  RegisterAsTenant,
  pagesRouters,
  roomsRouters,
  tenantTransactionRouter,
  transactionRouters,
  privateTransactionRouters,
  propertyRouters,
  paymentRouters,
  paymentMethodRouter,
};
