var express = require('express');
var router = express.Router();

const auth = require('../controller/authController');

router.post('/login', auth.login);
router.post('/register', auth.register)

router.get('/refresh-token', auth.refreshToken)

module.exports = router;
