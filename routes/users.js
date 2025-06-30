var express = require('express');
var router = express.Router();

const userController = require('../controller/userController');


router.get('/profile', userController.getProfile)
router.get('/:id', userController.getProfileById)

router.put('/profile/change-password', userController.changePassword)
router.put('/profile/edit', userController.editProfile)
router.get('/profile/followers', userController.getOwnFollowers)
router.get('/profile/following', userController.getOwnFollowing)

router.get('/:id/followers', userController.getFollowersDetail)
router.get('/:id/following', userController.getFollowingDetail)

router.post('/follow/:id', userController.followUser)
router.post('/unfollow/:id', userController.unfollowUser)

module.exports = router;
