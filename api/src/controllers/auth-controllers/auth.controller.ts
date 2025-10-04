
import { Request, Response } from "express";
import { COOKIE_NAME, COOKIE_OPTIONS, JWT_EXPIRATION_TIME, JWT_SECRET, JWT_SECRET_REFRESH, REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS, REFRESH_TOKEN_EXPIRY } from "src/utils/constants";
import * as jose from 'jose';


// --- Verify Admin Users ---
// export const verifyAdminUsers = async (req: Request, res: Response): Promise<void> => {
//     try {

//         const result = await checkAdminUsers();

//         if (result.success === true) {
//             res.status(200).json({
//                 message: `System has no admin user.`,
//                 success: true,
//             });
//             return;
//         }

//         res.status(200).json({
//             message: "System already have admin users.",
//             success: false,
//         });

//     } catch (error) {
//         console.error("Error verifying admin users:", error);
//         res.status(500).json({ message: "Internal server error", success: true });
//     }
// };

// --- Create Admin User ---
// export const createAdminUser = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { email, password, name } = req.body;
//         const data = {
//             email,
//             password,
//             name,
//             auth: AUTH_ROLES.ADMIN.id,
//             auth_description: AUTH_ROLES.ADMIN.description
//         };

//         const insertResult = await insertUser(data);

//         if (!insertResult.success) {
//             res.status(409).json({
//                 message: insertResult.msg,
//             });
//             return
//         }

//         // Successfully created
//         res.status(201).json({
//             message: insertResult.msg,
//         });
//     } catch (error) {
//         console.error("Error creating user:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// }

// --- Sign Up User ---
export const signUpUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name } = req.body;
        const data = {
            email,
            password,
            name,
            auth: AUTH_ROLES.CUSTOMER.id,
            auth_description: AUTH_ROLES.CUSTOMER.description
        };

        const result = await insertUser(data)

        if (!result.success) {
            res.status(409).json({
                message: result.msg,
            });
            return
        }

        // Successfully created
        res.status(201).json({
            message: result.msg,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// --- Login User ---
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const platform = req.headers["platform"]

        // Validate input
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }

        const user = await verifyLogin(email, password);

        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        const userInfo = {
            id: user.id,
            email: user.email,
            name: user.name,
            auth: user.auth,
            auth_description: user.auth_description,
            default_price_class: user.default_price_class,
            salesman_code: user.salesman_code,
            address: user.address,
            city: user.city,
            province: user.province,
            zip_code: user.zip_code,
            contact_no: user.contact_no
        }

        const issuedAt = Math.floor(Date.now() / 1000);
        const sub = user.id!.toString();
        const jti = crypto.randomUUID();

        const accessToken = await new jose.SignJWT(userInfo)
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(JWT_EXPIRATION_TIME)
            .setSubject(sub)
            .setIssuedAt(issuedAt)
            .sign(new TextEncoder().encode(JWT_SECRET));


        const refreshToken = await new jose.SignJWT({
            sub,
            jti,
            type: "refresh",
            //...userInfo,
        }).setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(REFRESH_TOKEN_EXPIRY)
            .setIssuedAt(issuedAt)
            .sign(new TextEncoder().encode(JWT_SECRET_REFRESH));


        if (platform === 'web') {
            res.cookie(COOKIE_NAME, accessToken, COOKIE_OPTIONS);
            res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

            //console.log("Cookies set:", res.getHeaders());

            res.status(200).json({
                message: "Login successful",
                success: true,
                userInfo,
            });

            // res.status(200).json({
            //     message: "Login successful",
            //     success: true,
            //     access_token: accessToken,
            //     cookie_options: COOKIE_OPTIONS,
            //     refresh_token: refreshToken,
            //     refresh_cookie_options: REFRESH_COOKIE_OPTIONS
            // })
            return
        }

        res.status(200).json({
            message: "Login successful",
            success: true,
            access_token: accessToken,
            refresh_token: refreshToken,
        })

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}