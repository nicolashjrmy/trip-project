var express = require('express');
var router = express.Router();

const userController = require('../controller/userController');

router.get('/:id', userController.getProfileById)

router.get('/profile', userController.getProfile)
router.put('/profile/change-password', userController.changePassword)
router.put('/profile/edit', userController.editProfile)


router.get('/:id/followers', userController.getFollowersDetail)
router.get('/:id/following', userController.getFollowingDetail)

router.post('/follow/:id', userController.followUser)
router.post('/unfollow/:id', userController.unfollowUser)

module.exports = router;
