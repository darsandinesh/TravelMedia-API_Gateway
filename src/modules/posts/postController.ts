import { Request, Response } from 'express';
import postRabbitMqClient from './rabbitMQ/client';
import userRabbitMqClient from '../../modules/user/rabbitMQ/client';
import { sendNotification } from '../../socket/socketServer'


interface Post {
    _id: string;
    userId: string;
    reportPost: string[];
}

interface User {
    id: any;
    _id: string;
}

interface RabbitMQResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

interface data {
    userId: string;
    description: string;
    place: string;
    postId?: string;
}

interface Notification {
    userId: string,
    senderId: string,
    type: string,
    message: string,
    avatar: string,
    userName: string,
    postId: string
}

const validImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

export const postController = {

    addPost: async (req: Request, res: Response) => {
        try {
            console.log('addPost function called')
            console.log(req.files, '------------', req.body)
            const data: data = req.body;
            const images = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];

            if (!data.userId) {
                return res.status(400).json({ success: false, message: 'UserId is missing' });
            }
            console.log('1');

            if (images) {
                let filesArray: Express.Multer.File[] = [];
                if (Array.isArray(images)) {
                    filesArray = images;
                } else {
                    filesArray = Object.values(images).flat();
                }

                for (let file of filesArray) {
                    if (!validImageMimeTypes.includes(file.mimetype)) {
                        return res.status(400).json({ error: "Only image files are allowed" });
                    }
                }
            }

            const userId = data.userId;
            const description = data.description;
            const place = data.place

            const operation = 'create-post';
            const response = await postRabbitMqClient.produce(
                { userId, description, place, images }, operation
            )
            console.log('3')
            console.log(response, '-------------------post added to database');
            return res.status(200).json(response);
        } catch (error) {
            console.log('4')
            return res.status(500).json({ success: false, message: 'Error occurred while creating new post' });
        }
    },

    editPost: async (req: Request, res: Response) => {
        try {
            const data: data = req.body;
            const images = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];

            console.log(data);
            console.log(images);

            if (!data.userId) {
                return res.status(400).json({ success: false, message: 'UserId is missing' });
            }

            if (images) {
                let filesArray: Express.Multer.File[] = [];
                if (Array.isArray(images)) {
                    filesArray = images;
                } else {
                    filesArray = Object.values(images).flat();
                }

                for (let file of filesArray) {
                    if (!validImageMimeTypes.includes(file.mimetype)) {
                        return res.status(400).json({ error: "Only image files are allowed" });
                    }
                }
            }

            const userId = data.userId;
            const description = data.description;
            const place = data.place
            const postId = data.postId

            const operation = 'edit-post';
            const response = await postRabbitMqClient.produce(
                { userId, postId, description, place, images }, operation
            )
            console.log(response);
            res.status(200).json(response);
        } catch (error) {
            console.log('Error in the editpost -->', error);
            return res.status(500).json({ success: false, message: "Error occured while editing the post" })
        }
    },

    deletePost: async (req: Request, res: Response) => {
        try {
            const id = req.body.postId;
            const operation = 'deletePost';
            const result = await postRabbitMqClient.produce(id, operation);
            res.status(200).json(result);

        } catch (error) {
            console.log('Error in the deletePost -->', error);
            return res.status(500).json({ success: false, message: "Error occured while deleting the post" })
        }
    },


    deletePostAdmin: async (req: Request, res: Response) => {
        try {
            const id = req.body.postId;
            const userId = req.body.userId
            const operation = 'deletePost';
            const result: any = await postRabbitMqClient.produce(id, operation);
            userRabbitMqClient.produce(userId, 'sendMsg')
            res.status(200).json(result);

        } catch (error) {
            console.log('Error in the deletePost -->', error);
            return res.status(500).json({ success: false, message: "Error occured while deleting the post" })
        }
    },

    reportPost: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const operation = 'reportPost';
            const result = await postRabbitMqClient.produce(data, operation);
            res.status(200).json(result);
        } catch (error) {
            console.log('Error in the reportPost -->', error);
            return res.status(500).json({ success: false, message: "Error occured while reporting the post" })
        }
    },

    deleteImage: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const operation = 'deleteImage';
            const result = await postRabbitMqClient.produce(data, operation);
            res.status(200).json(result)
        } catch (error) {
            console.log('Error in the reportPost -->', error);
            return res.status(500).json({ success: false, message: "Error occured while deleteing the image" })
        }
    },

    searchPost: async (req: Request, res: Response) => {
        try {
            const operation = 'search_post';
            console.log(req.body);
            const result = await postRabbitMqClient.produce(req.body, operation);
            console.log(result);
            res.status(200).json(result)
        } catch (error) {
            console.log('Error in search Post -->', error);
            return res.status(500).json({ success: false, message: "Internal Server Error" })
        }
    },

    getAllPosts: async (req: Request, res: Response) => {
        try {
            console.log('get all post');
            const page = req.query.page
            console.log(page, '---------------page in getallpost')
            const operation = 'get-all-posts';
            const result = await postRabbitMqClient.produce(page, operation) as RabbitMQResponse<Post[]>;

            if (result.success && Array.isArray(result.data)) {
                const userIds = [...new Set(result.data.map((post) => post.userId))];
                const userOperation = 'get-user-deatils-for-post';

                console.log(userIds, '--------------------userIds');
                const userResponse = (await userRabbitMqClient.produce({ userIds }, userOperation)) as RabbitMQResponse<User[]>;

                if (userResponse.success && Array.isArray(userResponse.data)) {
                    const userMap = new Map(userResponse.data.map((user) => [user.id, user]));

                    const combinedData = result.data.map((post) => {
                        const user = userMap.get(post.userId) || null;
                        return { ...post, user };
                    });

                    // Return combined data in response
                    console.log(combinedData)
                    return res.status(200).json({ success: true, data: combinedData, count: result });
                } else {
                    // Handle case where user data is not available
                    console.error('User data fetch failed or is not an array');
                    return res.status(500).json({ success: false, message: 'Error fetching user details' });
                }
            } else {
                // Handle case where posts data is not available
                console.error('Posts data fetch failed or is not an array');
                return res.status(500).json({ success: false, message: 'Error fetching posts' });
            }
        } catch (error) {
            console.error('Error in getAllPosts:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    reportedPost: async (req: Request, res: Response) => {
        try {
            const page = req.query.page;
            const operation = 'get-reported-post';
            const result = await postRabbitMqClient.produce(page, operation) as RabbitMQResponse<any[]>;

            if (result.success && Array.isArray(result.data)) {
                const userIds = [...new Set(result.data.map((post) => post.userId))];
                const userOperation = 'get-user-deatils-for-post';
                const userResponse = (await userRabbitMqClient.produce({ userIds }, userOperation)) as RabbitMQResponse<User[]>;

                if (userResponse.success && Array.isArray(userResponse.data)) {
                    const userMap = new Map(userResponse.data.map((user) => [user.id, user]));

                    const combinedData = result.data.map((post) => {
                        const user = userMap.get(post.userId) || null;
                        return { ...post, user };
                    })

                    return res.status(200).json({ success: true, data: combinedData, count: result.data });
                } else {
                    return res.status(500).json({ success: false, message: 'Error fetching user details' });
                }
            } else {
                res.status(500).json({ success: false, message: 'Error fetching post details' })
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },


    getUserPosts: async (req: Request, res: Response) => {
        try {
            console.log('post service trigger in api gateway');
            const operation = 'get-user-posts';
            console.log(req.body, '------------------userprofile in api gateway');
            const id = req.body.id;

            // Fetch posts and user data asynchronously
            const [result, userData]: [any, any] = await Promise.all([
                postRabbitMqClient.produce(id, operation),
                userRabbitMqClient.produce(id, 'get-userProfile')
            ]);

            const savedPosts = [];
            console.log(userData, '-----------------')
            if (userData.data.savedPosts && userData.data.savedPosts.length > 0) {
                console.log('inside the saved posts');
                const data = await postRabbitMqClient.produce(userData.data.savedPosts, 'getSavedPosts')
                savedPosts.push(data);
            }

            const combinedData = {
                result,
                userData: userData,
                savedPosts,
            };

            console.log(combinedData, '-----------------------');
            res.status(200).json(combinedData);
        } catch (error) {
            console.log("Error in getUserPosts: ", error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },


    getNewPosts: async (req: Request, res: Response) => {
        try {
            const operation = 'getNewPosts';
            const result = await postRabbitMqClient.produce('', operation);
            // console.log(result);
            res.status(200).json(result);
        } catch (error) {
            console.log("Error in getNewPosts -->", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    getPost: async (req: Request, res: Response) => {
        try {
            const operation = 'getPost';

            const [result, userData]: any = await Promise.all([
                postRabbitMqClient.produce(req.query.postId, operation),
                userRabbitMqClient.produce(req.query.userId, 'get-userProfile')
            ])
            let post = result.data
            let user = userData.data
            const combinedData = {
                success: result.success,
                message: 'data fetched success',
                post,
                user,
            };

            // const result = await postRabbitMqClient.produce(req.query.postId, operation);
            console.log(combinedData)
            res.status(200).json(combinedData);
        } catch (error) {
            console.log('Error in getPost Post Controller');
        }
    },


    likePost: async (req: Request, res: Response) => {
        try {
            console.log(req.body);
            const data = req.body;
            const operation = 'likePost';
            const result: any = await postRabbitMqClient.produce(data, operation);


            if (result.success) {
                const postData: any = await postRabbitMqClient.produce(data.postId, 'getPost');
                const userData: any = await userRabbitMqClient.produce(data.logged, 'get-userProfile');
                console.log(userData, 'like like ')
                console.log(postData)
                const notification: Notification = {
                    userId: data.logged,
                    senderId: postData.data.data.userId,
                    type: 'LIKE',
                    postId: postData.data.data._id,
                    message: `${userData.data.name} liked your post`,
                    avatar: userData.data.profilePicture,
                    userName: userData.data.name
                }
                sendNotification(notification);
            }


            res.status(200).json(result);
        } catch (error) {
            console.log('error in likePost -->', error)
        }
    },

    unlikePost: async (req: Request, res: Response) => {
        try {
            console.log(req.body);
            const data = req.body;
            const operation = 'unlikePost';
            const result = await postRabbitMqClient.produce(data, operation);
            res.status(200).json(result);
        } catch (error) {
            console.log('error in likePost -->', error)
        }
    },

    comment: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const operation = 'comment'
            const result = await postRabbitMqClient.produce(data, operation);
            res.status(200).json(result);
        } catch (error) {
            console.log('Error in teh comment section in postController')
        }
    },

    deleteComment: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const operation = 'deletComment';
            const result = await postRabbitMqClient.produce(data, operation);
            res.status(200).json(result)
        } catch (error) {
            console.log('Error in the deleteComment -->', error);
        }
    },

    findBuddy: async (req: Request, res: Response) => {
        try {
            console.log(req.body);
            console.log(req.files);
            console.log('find buddy')
            const data = req.body;
            const images = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];

            if (!data.userId) {
                return res.status(400).json({ success: false, message: 'UserId is missing' });
            }

            if (images) {
                let filesArray: Express.Multer.File[] = [];
                if (Array.isArray(images)) {
                    filesArray = images;
                } else {
                    filesArray = Object.values(images).flat();
                }

                for (let file of filesArray) {
                    if (!validImageMimeTypes.includes(file.mimetype)) {
                        return res.status(400).json({ error: "Only image files are allowed" });
                    }
                }
            }

            const operation = 'findBuddy';
            const response = await postRabbitMqClient.produce({ data, images }, operation);
            console.log(response);
            return res.status(200).json(response);


        } catch (error) {
            console.log('Error in the findBuddy post')
        }
    },

    getfindBuddy: async (req: Request, res: Response) => {
        try {
            const operation = 'getfindBuddy';
            const page = req.query.page;
            const result: any = await postRabbitMqClient.produce(page, operation);
            console.log(result, 'api data kitti');
            if (result.success && Array.isArray(result.data)) {
                const userIds = [...new Set(result.data.map((post: any) => post.userId))]
                const operation = 'get-user-deatils-for-post';

                const userResponse = (await userRabbitMqClient.produce({ userIds }, operation)) as RabbitMQResponse<User[]>

                if (userResponse.success && Array.isArray(userResponse.data)) {
                    const userMap = new Map(userResponse.data.map((user) => [user.id, user]));
                    const combinedData = result.data.map((post: any) => {
                        const user = userMap.get(post.userId) || null
                        return { ...post, user };
                    })
                    console.log(combinedData, 'combineddAta')
                    return res.status(200).json({ success: true, data: combinedData });
                } else {
                    return res.status(500).json({ success: false, message: 'Error fetching user details' });

                }
            } else {
                return res.status(500).json({ success: false, message: 'Error fetching posts' });

            }
        } catch {

        }
    },

    getlikedPosts: async (req: Request, res: Response) => {
        try {
            console.log(req.body);
            const userId = req.query.id
        } catch (error) {
            console.log('Error in likedPosts in postController', error);
            res.status(500).json({ success: false, message: 'Internal server error, Try after sometime' })
        }
    },



}