import { DataSource } from "typeorm";
import { db } from './../database/db';
import { Theme } from "../database/models/theme";
import fs from 'fs';
import path from 'path';

export class CommonUseCase {

    constructor(private readonly db:DataSource) {}

    async downloadThemeFile(themeName: string){
        const theme = await db.getRepository(Theme).findOne({
            where: {
                name: themeName
            }
        })
        if (!theme) {
            throw new Error('Theme not found')
        }
        // get the the path of the theme, get the file and return a blob of the file
        const filePath = path.resolve(theme.path);
        const file = fs.readFileSync(filePath);
        // return the file as a blob
        //change it's name to the theme name and the extension to .css


        return Buffer.from(file)

        
    }
}