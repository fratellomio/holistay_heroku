const authControllers = require('./auth/authControllers');
const userControllers = require('./userControllers');
const tenantControllers = require('./tenantControllers');
const refreshTokenController = require('./auth/refreshTokenController');
const logoutController = require('./auth/logoutController');
const RegisterAsTenant = require('./registerAsTenantController');
const tenantTransaction = require('./transactionTenantControllers');
const pagesControllers = require('./pagesControllers');
const roomControllers = require('./roomsControllers');
const paymentController = require('./transaction/paymentController');
const transactionControllers = require('./transaction/transactionControllers');
const privateTransactionControllers = require('./transaction/privateTransactionControllers');
const registerAsTenantController = require('./registerAsTenantController');
const propertyControllers = require('./property/propertyControllers');
const reportControllers = require('./reportControllers');
const paymentMethodControllers = require('./transaction/paymentMethodControllers');

module.exports = {
  authControllers,
  userControllers,
  tenantControllers,
  refreshTokenController,
  logoutController,
  RegisterAsTenant,
  pagesControllers,
  roomControllers,
  tenantTransaction,
  transactionControllers,
  privateTransactionControllers,
  registerAsTenantController,
  propertyControllers,
  reportControllers,
  paymentController,
  paymentMethodControllers,
};
