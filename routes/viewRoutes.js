const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/receivetoken', authController.ssoReceiveToken);

router.use(authController.isLoggedInView);
router.get('/', viewsController.getOverview);
router.get('/after-sso', viewsController.afterSSO);
router.get(
  '/login',
  authController.ensureSingleSignOn,
  viewsController.getLoginForm,
  viewsController.getOverview
);
router.get('/me', authController.requireLogin, viewsController.getAccount);
router.get('/admin-overview', viewsController.getAdminOverview);

module.exports = router;
