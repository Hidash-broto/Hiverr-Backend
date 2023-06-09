const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  doSignup, clientList, clientBlock, gigList, messageUserAdd, getAllMessengers, favouriteGig,
  getFavorites, gigRequest, getNotification, amountPick, payment, doPayment, getAllStatus,
  doDownload, closeOrder, freelancerCalling,
} = require('../controllers/client');

router.post('/signup', doSignup);
router.get('/list', clientList);
router.put('/block', clientBlock);
router.post('/gigList', gigList);
router.post('/messageUserAdd', authMiddleware, messageUserAdd);
router.get('/getAllMessengers', authMiddleware, getAllMessengers);
router.post('/favouriteGig', authMiddleware, favouriteGig);
router.get('/getFavorites', authMiddleware, getFavorites);
router.post('/gigRequest', authMiddleware, gigRequest);
router.get('/getNotification', authMiddleware, getNotification);
router.post('/amountPick', authMiddleware, amountPick);
router.post('/payment', payment);
router.post('/doPayment', authMiddleware, doPayment);
router.get('/getAllStatus', authMiddleware, getAllStatus);
router.post('/doDownload', doDownload);
router.put('/closeOrder', authMiddleware, closeOrder);
router.put('/freelancerCalling', authMiddleware, freelancerCalling);

module.exports = router;
