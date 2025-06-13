var express = require('express');
var router = express.Router();

const userController = require('../controller/userController');
const auth = require('../middleware/auth');

router.post('/login', userController.login)
router.post('/register', userController.register)
router.put('/change-password', auth.isLogin , userController.changePassword)

module.exports = router;
