import express from 'express';
import upload from '../../multer/multer';
import authencticateToken from '../../middleware/authMiddleware';
import { postController } from './postController';
import multer from 'multer';
const postRoutes = express.Router();

const authMiddleware = authencticateToken({ role: 'user' });


postRoutes.get('/', (req, res) => {
    res.send('post route entered');
})

postRoutes.post('/add-post', authMiddleware, upload.array('files'), postController.addPost);
postRoutes.get('/getAllPosts',authMiddleware, postController.getAllPosts)
postRoutes.get('/reportedPost',authMiddleware,postController.reportedPost);
// postRoutes.get('/getreportPost',authMiddleware, postController.getReportPost)
postRoutes.post('/getUserPosts', authMiddleware, postController.getUserPosts)
postRoutes.get('/getNewPosts', postController.getNewPosts);
postRoutes.get('/getPost',authMiddleware,postController.getPost)
postRoutes.put('/editPost',authMiddleware,upload.array('images'),postController.editPost)
postRoutes.put('/deletePost',authMiddleware,postController.deletePost)
postRoutes.put('/deletePostAdmin',authMiddleware,postController.deletePostAdmin)
postRoutes.put('/reportPost',authMiddleware,postController.reportPost)
postRoutes.put('/deleteImage',authMiddleware,postController.deleteImage);
postRoutes.post('/searchPost',authMiddleware,postController.searchPost)

// find buddy end points 
postRoutes.post('/findBuddy', authMiddleware, upload.array('files'), postController.findBuddy)
postRoutes.get('/getfindBuddy',authMiddleware,postController.getfindBuddy)

// like and unlike posts
postRoutes.post('/likePost', authMiddleware, postController.likePost)
postRoutes.post('/UnlikePost', authMiddleware, postController.unlikePost)

// comment the post 
postRoutes.post('/comment', authMiddleware, postController.comment);
postRoutes.put('/deleteComment',authMiddleware,postController.deleteComment)

//router to get the liked post by the user;
postRoutes.get('/likedPosts', authMiddleware, postController.getlikedPosts)



export { postRoutes };