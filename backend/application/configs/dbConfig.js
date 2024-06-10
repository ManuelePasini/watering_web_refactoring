import { Sequelize } from 'sequelize';

const config = {
    database: 'postgres',
    username: 'postgres',
    password: 'psw',
    host: 'localhost',
    dialect: 'postgres',
    port: '5432'
};

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    logging: true,
    define: {
        freezeTableName: true
    },
});

export default sequelize