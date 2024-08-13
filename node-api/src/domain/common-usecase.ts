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
        const filePath = path.resolve(theme.path);
        const file = fs.readFileSync(filePath);

        return Buffer.from(file)
    }

    async getThemes() {
        return await db.getRepository(Theme).find();
    }
}