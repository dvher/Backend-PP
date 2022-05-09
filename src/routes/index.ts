import { Router } from "express";

const router = Router();

import {
    register,
    login
} from '../controllers';

router.post('/api/register', register);
router.post('/api/login', login);

export default router;