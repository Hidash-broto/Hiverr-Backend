const router = require('express').Router();
require('dotenv').config();
const authMiddleware = require('../middleware/authMiddleware');

const {
  adminLogin, userCheck, getAllPendingGigs, gigStatusChange, getAllPayments,
  payment, doPayment,
} = require('../controllers/admin');

router.post('/login', adminLogin);
router.post('/signup', userCheck);
router.get('/getAllPendingGigs', getAllPendingGigs);
router.post('/gigStatusChange', gigStatusChange);
router.get('/getAllPayments', authMiddleware, getAllPayments);
router.post('/payment', payment);
router.post('/doPayment', doPayment);

module.exports = router;
