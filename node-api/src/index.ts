import express from 'express';
import { routes } from './Controller/routes';
import { db } from './database/db';
import { logger } from './common/logger';
import fs from 'fs';
import 'reflect-metadata';

import dotenv from 'dotenv';

dotenv.config();


const customLogger = (req :express.Request, res : express.Response, next: express.NextFunction) => {
    logger.apiPath(`[${req.method}] ${req.url}`);

    res.on("finish", () => {
        if (res.statusCode >= 400) {
            logger.error(`[${req.method}] ${req.url} - ${res.statusCode}`);
            return;
        }
        logger.success(`[${req.method}] ${req.url} - ${res.statusCode}`);
    });

    next();
};

const main = async () => {
    const app = express();
    const port = process.env.APP_PORT;

    const maxRetries = 5;
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await db.initialize();
            logger.success("Successfully connected to the database");
            break; // Exit the loop if connection is successful
        } catch (error : any) {
            retries++;
            logger.error(`Attempt ${retries} - Error connecting to the database: ${error.message}`);
            if (retries >= maxRetries) {
                logger.critical("Max retries reached, exiting");
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, 5000)); // Wait for 5 seconds before retrying
        }
    }
    //check that path exists from proccess.env.FILE_STORAGE_PATH
    if (!fs.existsSync(process.env.FILE_STORAGE_PATH!)) {
        logger.error("FILE_STORAGE_PATH does not exist")
        //create it 
        fs.mkdirSync(process.env.FILE_STORAGE_PATH!)
    }

    app.use(express.json())
    //app.use(morgan("tiny"));
    app.use(express.static("public"));
    app.use(customLogger)
    routes(app);
    app.listen(port, () => {
        // logger.info("user logged in");
        // logger.error("user logged in");
        logger.success(`Server is running on port ${port}`);
        logger.info(`The server is running in env = ${process.env.NODE_ENV}`);
        // logger.info(`Swagger is running on http://localhost:${port}/docs`);
    });
};
main();