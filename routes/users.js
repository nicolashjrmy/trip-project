var express = require('express');
var router = express.Router();

const userController = require('../controller/userController');
const auth = require('../middleware/auth');

router.get('/profile', auth.isLogin , userController.getProfile)
router.put('/change-password', auth.isLogin , userController.changePassword)

module.exports = router;
