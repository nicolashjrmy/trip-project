var express = require('express');
var router = express.Router();

const userController = require('../controller/userController');

router.get('/profile', userController.getProfile)
router.get('/profile/:id', userController.getProfileById)
router.put('/change-password', userController.changePassword)

router.get('/:id/followers', userController.getFollowersDetail)
router.get('/:id/following', userController.getFollowingDetail)

router.post('/follow/:id', userController.followUser)
router.post('/unfollow/:id', userController.unfollowUser)

module.exports = router;
