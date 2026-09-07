import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import knex, { Knex } from 'knex';
import { readFile } from 'node:fs/promises';
import request from 'supertest';
import type { Express } from 'express';

export interface TestDatabase {
    db: Knex;
    container: StartedPostgreSqlContainer;
}

export const setupDb = async (): Promise<TestDatabase> => {
    // 1. Start PostgreSQL Container
    const container = await new PostgreSqlContainer(
        'postgis/postgis:17-3.5'
    )
        .withDatabase('watering_test_db')
        .withUsername('postgres')
        .withPassword('test_password')
        .start();

    // 2. Set ENV variables
    process.env.DB_HOST = container.getHost();
    process.env.DB_PORT = String(container.getPort());
    process.env.DB_NAME = container.getDatabase();
    process.env.DB_USER = container.getUsername();
    process.env.DB_PASSWORD = container.getPassword();

    const dbConfig: Knex.PgConnectionConfig = {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };

    console.log('Test DB Config:', dbConfig);

    // 3. Initialize Knex
    const db = knex({
        client: 'pg',
        connection: dbConfig,
    });

    // 4. Run Schema
    const sql = await readFile(
        './tests/db/test_db_schema.sql',
        'utf8'
    );

    await db.raw(sql);

    return { db, container };
};


export const loginUser = async (
    app: Express,
    email: string,
    password: string
): Promise<string> => {
    const loginRes = await request(app)
        .post('/users/login')
        .send({
            email,
            password,
        })
        .expect(200);

    if (!loginRes.body.token) {
        throw new Error(
            `Login failed: ${JSON.stringify(loginRes.body)}`
        );
    }

    return loginRes.body.token;
};


export const table = <
    TRecord extends {} = Record<string, unknown>,
    TResult = TRecord[]
>(
    db: Knex,
    tableName: string,
    schema = 'public'
) => {
    return db<TRecord, TResult>(tableName)
        .withSchema(schema);
};