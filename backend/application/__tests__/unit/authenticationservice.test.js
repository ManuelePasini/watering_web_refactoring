const AuthenticationService = require('../../services/AuthenticationService');
const { mock } = require('jest-mock-extended');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = 'ol/utMQ2YBlP1gOyucuWsphBOmKBQA8GiiUYGJyAvch30paQhlsT+RfB7BGU0UAl';

jest.mock('bcrypt');
jest.mock('jsonwebtoken')

describe('AuthenticationService', () => {
    let userService;
    let authService;

    beforeEach(() => {
        userService = mock();
        authService = new AuthenticationService(userService);
    });

    describe('generateJwt', () => {
        it('should throw an error if the email does not exist', async () => {
            userService.findUserByEmail.mockResolvedValue(null);

            await expect(authService.generateJwt({ email: 'nonexistent@example.com' })).rejects.toThrow('The mail does not exist');
        });

        it('should throw an error if the password is invalid', async () => {
            const fakeUser = { id: { password: 'password' } };
            userService.findUserByEmail.mockResolvedValue(fakeUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(authService.generateJwt({ email: 'test@example.com', password: 'wrongpassword' })).rejects.toThrow('The password is invalid');
        });

        it('should generate a jwt if the password is valid', async () => {
            const fakeUser = { id: { password: 'password' } };
            userService.findUserByEmail.mockResolvedValue(fakeUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('FAKE_JWT');

            const generatedJwt = await authService.generateJwt({ email: 'test@example.com', password: 'password' });

            expect(generatedJwt).toBe('FAKE_JWT');
        });
    });

    describe('validateJwt', () => {
        it('should throw an error if the bearer token is not provided', async () => {
            await expect(authService.validateJwt('')).rejects.toThrowError(new Error('Authentication failed: bearer header not found.'));
        });

        it('should throw an error if the jwt is invalid', async () => {
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(new Error('Invalid token'));
            });

            await expect(authService.validateJwt('Bearer INVALID_JWT')).rejects.toThrow('Authentication failed: token verify error');
        });
    });
});