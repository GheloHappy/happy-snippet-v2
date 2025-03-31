import {Request, Response} from 'express';
import {insertUser, verifyUser} from "../models/user-model.js";
import * as console from "node:console";

export const insertUser_Cont = async (req: Request, res: Response): Promise<Response> => {
    try {
        const data = {
            username: req.body.username as string,
            email: req.body.email as string,
            password: req.body.password as string,
        };

        // Check if user exists
        const userExists = await new Promise((resolve) => {
            verifyUser(data.username, false, (result) => resolve(result));
        });

        if (!(userExists as any).passed) {
            return res.json(userExists);
        }

        // Insert user
        const insertResult = await new Promise((resolve) => {
            insertUser(data, (result) => resolve(result));
        });

        return res.json(insertResult);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
};


// export const insertUserSettings_Cont = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const data = {
//             user_id: req.body.user_id as number,
//             dark_mode: req.body.dark_mode as boolean,
//             snippet_theme: req.body.snippet_theme as string,
//             snippet_line_numbers: req.body.snippet_line_numbers as boolean,
//             snippet_wrap_lines: req.body.snippet_wrap_lines as boolean,
//         };
//
//         insertUserSettings(data, (result: any) => {
//             return res.json(result);
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({msg: 'Internal Server Error'});
//     }
// };
