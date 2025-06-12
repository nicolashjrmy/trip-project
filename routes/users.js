var express = require('express');
var router = express.Router();

const userController = require('../controller/userController');

router.post('/login', userController.login)
router.post('/register', userController.register)
router.put('/change-password', userController.changePassword)

module.exports = router;
