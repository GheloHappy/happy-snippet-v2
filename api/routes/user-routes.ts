import express from "express";
import {insertUser_Cont} from "../controllers/user-cont.js";

const router = express.Router();
const version: string = process.env.API_VERSION || 'v1';

router.post(`/api/${version}/user`, insertUser_Cont);

export default router;
