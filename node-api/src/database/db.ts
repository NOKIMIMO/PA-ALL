import { DataSource } from "typeorm";

import dotenv from 'dotenv';

dotenv.config();

export const db = new DataSource({
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  host:( process.env.NODE_ENV === "dev" ?  'localhost':'pgsql-db' ),
  logging:false,
  type:'postgres',
  synchronize: true,
    entities: [
        process.env.NODE_ENV === "dev" ? "src/database/models/*.ts" : "dist/database/models/*.js"
    ],
    migrations: [
        process.env.NODE_ENV === "dev" ? "src/database/migrations/*.ts" : "dist/database/migrations/*.js"
    ]
});
