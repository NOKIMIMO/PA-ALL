import { NextFunction, Response, Request } from "express";
import { db } from "../../database/db";
import { User } from "../../database/models/user";
import { user_access_type } from "../enum/access-type";
import { JwtPayload } from "jsonwebtoken";
// maybe will be deleted
export const accessMiddleware = (getAccessList: () => user_access_type[]) => {
    return async (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
        const userRepository = db.getRepository(User);
        const user = await userRepository.findOneBy({ id: req.user?.userId });
        if (!user) {
            return res.status(401).json({ "error": "Unauthorized" });
        }
        const access_list = getAccessList(); // Get the access list dynamically
        if (!access_list.includes(user.role.toLowerCase() as user_access_type)) {
            return res.status(403).json({ "error": "Access Forbidden" });
        }
        next(); // Call next() to continue to the next middleware or route handler
    };
};