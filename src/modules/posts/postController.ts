import { Request, Response } from 'express';
import postRabbitMqClient from './rabbitMQ/client';
import userRabbitMqClient from '../../modules/user/rabbitMQ/client';


interface Post {
    _id: string;
    userId: string;
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

    getAllPosts: async (req: Request, res: Response) => {
        try {
            console.log('get all post');
            const page = req.query.page
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
                    return res.status(200).json({ success: true, data: combinedData });
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

    getUserPosts: async (req: Request, res: Response) => {
        try {
            console.log('post service trigger in api gateway');
            const operation = 'get-user-posts';
            console.log(req.body, '------------------userprofile in api gateway');
            const id = req.body.id;

            // Fetch posts and user data asynchronously
            const [result, userData] = await Promise.all([
                postRabbitMqClient.produce(id, operation),
                userRabbitMqClient.produce(id, 'get-userProfile')
            ]);

            // Combine the result and userData into a single object
            const combinedData = {
                result, // Spread the result object properties
                userData: userData, // Include userData as a nested object
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