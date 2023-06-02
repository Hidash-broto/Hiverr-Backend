const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  doSignup, freelancerList, freelancerBlock, doGigSave, getAllMessengers, getNotification,
  requestAccept, gigReject, dashboardDatas, getAllEarningsData, getUserDt, updateWorkStatus,
  submitOrder,
} = require('../controllers/freelancer');

router.post('/signup', doSignup);
router.get('/list', freelancerList);
router.put('/block', freelancerBlock);
router.post('/gigCreation', authMiddleware, doGigSave);
router.get('/getAllMessengers', authMiddleware, getAllMessengers);
router.get('/getNotification', authMiddleware, getNotification);
router.post('/requestAccept', authMiddleware, requestAccept);
router.post('/gigReject', authMiddleware, gigReject);
router.get('/dashboardDatas', authMiddleware, dashboardDatas);
router.get('/getAllEarningsData', authMiddleware, getAllEarningsData);
router.get('/getUserDt', authMiddleware, getUserDt);
router.put('/updateWorkStatus', authMiddleware, updateWorkStatus);
router.post('/submitOrder', submitOrder);

module.exports = router;
