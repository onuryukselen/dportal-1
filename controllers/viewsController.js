const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  res.status(200).render('overview', {
    title: 'Overview'
  });
});

exports.getAdminOverview = catchAsync(async (req, res, next) => {
  res.status(200).render('admin-overview', {
    title: 'Admin Dashboard'
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.afterSSO = (req, res) => {
  res.status(200).render('after-sso');
};

exports.getLoginForm = (req, res, next) => {
  if (process.env.SSO_LOGIN !== 'true') {
    res.status(200).render('login', {
      title: 'Log into your account'
    });
  } else {
    next();
  }
};
