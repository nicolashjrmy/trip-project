var express = require('express');
var router = express.Router();

const user = require('../controller/userController');

router.post('/login', user.login);
router.post('/register', user.register)

module.exports = router;
