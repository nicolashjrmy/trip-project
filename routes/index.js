var express = require('express');
var router = express.Router();

const auth = require('../controller/authController');
const middleware = require('../middleware/auth');

router.post('/login', auth.login);
router.post('/register', auth.register)
router.post('/logout', middleware.isLogin, auth.logout)

router.get('/refresh-token', auth.refreshToken)

module.exports = router;
