const express = require('express');
const authController = require('../controllers/authController');
const configController = require('../controllers/configController');

const router = express.Router();

router.use(authController.isLoggedIn);
router.use(authController.requireLogin);
router.use(authController.setDefPerms);

router
  .route('/')
  .get(configController.getAllConfigs)
  .post(authController.restrictTo('admin'), configController.createConfig);

router
  .route('/:id')
  .get(configController.getConfig)
  .patch(authController.restrictTo('admin'), configController.updateConfig)
  .delete(authController.restrictTo('admin'), configController.deleteConfig);

module.exports = router;
