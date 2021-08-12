const express = require('express');
const authController = require('../controllers/authController');
const configController = require('../controllers/configController');

const router = express.Router();

router.use(authController.isLoggedIn);
router.use(authController.requireLogin);
router.use(authController.restrictTo('admin'));
router.use(authController.setDefPerms);

router
  .route('/')
  .get(configController.getAllConfigs)
  .post(configController.createConfig);

router
  .route('/:id')
  .get(configController.getConfig)
  .patch(configController.updateConfig)
  .delete(configController.deleteConfig);

module.exports = router;
