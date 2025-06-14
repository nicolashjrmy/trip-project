var express = require('express');
var router = express.Router();

const userController = require('../controller/userController');

router.get('/profile', userController.getProfile)
router.put('/change-password', userController.changePassword)

router.post('/follow/:id', userController.followUser)
router.post('/unfollow/:id', userController.unfollowUser)

module.exports = router;
