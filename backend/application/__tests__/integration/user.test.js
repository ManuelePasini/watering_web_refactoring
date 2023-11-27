const {Sequelize, DataTypes} = require('sequelize');
const {PostgreSqlContainer} = require("@testcontainers/postgresql");

const initUser = require('../../persistency/model/User');
const UserRepository = require('../../persistency/repository/UserRepository');
describe("Integration test", () => {

    let container;
    let sequelize;
    let userRepository;

    beforeEach(async () => {
        container = await new PostgreSqlContainer()
            .withName('watering_postgres_test')
            .withUsername('testUser')
            .withPassword('testPass')
            .withExposedPorts(5432)
            .withDatabase('testDb')
            .start();

        sequelize = new Sequelize(container.getDatabase(), container.getUsername(), container.getPassword(), {
            host: container.getHost(),
            port: container.getPort(),
            dialect: 'postgres',
            logging: false
        });

        try {
            await sequelize.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }

        const User = initUser(sequelize);

        await User.sync({ force: true });

        await User.create({ email: 'user1@example.com', password: 'user1Pass', name:'User1', surname:'Surname1' });
        await User.create({ email: 'user2@example.com', password: 'user2Pass', name:'User2', surname:'Surname2' });

        console.log('Database successfully populated.');

        userRepository = new UserRepository(User);
    }, 20000);

    afterEach(async () => {
       await sequelize.close();
       await container.stop();
    }, 10000);


    test('shoult fetch users correctly', async () => {
        const users = await userRepository.findByEmail('user1@example.com');
        expect(users.dataValues.userId).toBe(1);
        expect(users.dataValues.email).toBe('user1@example.com');
        expect(users.dataValues.password).toBe('user1Pass');
        expect(users.dataValues.name).toBe('User1');
        expect(users.dataValues.surname).toBe('Surname1');
    }, 30000);

});