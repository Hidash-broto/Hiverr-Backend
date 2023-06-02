const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  doLogin, getUser, userAddMessage, getAllMessages, getCurrentUser,
} = require('../controllers/common');

router.post('/login', doLogin);
router.post('/get-user-info-by-id', authMiddleware, getUser);
router.post('/userAddMessage', userAddMessage);
router.post('/getAllMessages', getAllMessages);
router.get('/getCurrentUser', authMiddleware, getCurrentUser);

module.exports = router;
