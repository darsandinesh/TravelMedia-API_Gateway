import express from 'express';
import upload from '../../multer/multer';
import authencticateToken from '../../middleware/authMiddleware';
import { postController } from './postController';
const postRoutes = express.Router();

postRoutes.get('/', (req, res) => {
    res.send('post route entered');
})

postRoutes.post('/add-post', authencticateToken, upload.array('files'), postController.addPost);
postRoutes.get('/getAllPosts', postController.getAllPosts)
postRoutes.post('/getUserPosts', authencticateToken,postController.getUserPosts)
postRoutes.get('/getNewPosts',postController.getNewPosts);

//router to get the liked post by the user;
postRoutes.get('/likedPosts',authencticateToken,postController.getlikedPosts)
// postRoutes.get('/getTotalPosts',postController.getTotalPosts);

export { postRoutes };