import pkg from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
import { jwtSecret } from '../commons/constants.js'
import type { UserTokenRequest } from '../dtos/authenticationDto.js'
import UserService from './UserService.js'

const { sign, verify } = pkg

export type AuthenticatedUserPayload = {
  userId: number
  name?: string | null
  isAdmin?: boolean
}

class AuthenticationService {
  private userService: UserService

  constructor(userService: UserService) {
    this.userService = userService
  }

  async generateJwt(request: UserTokenRequest): Promise<string> {
    try {
      const user = await this.userService.findUserByEmail(request.email, true)

      if (!user) {
        throw new Error('The mail does not exist')
      }
      const match = user.password === request.password
      if (!match) {
        throw new Error('Password is invalid')
      }

      const isAdmin = await this.userService.isAdmin(user.id)
      const payload: AuthenticatedUserPayload = { userId: user.id, name: user.name, isAdmin }
      return sign(payload, jwtSecret, { expiresIn: '10h' })
    } catch (error) {
      throw new Error(`Error on generating jwt caused by: ${error}`)
    }
  }

  async validateJwt(header?: string): Promise<AuthenticatedUserPayload> {
    if (typeof header !== 'undefined' && header !== '') {
      const bearerToken = header.split(' ')[1]
      return new Promise((resolve, reject) => {
        verify(bearerToken, jwtSecret, (err, decoded) => {
          if (err) {
            reject(new Error('Authentication failed: token verify error'))
            return
          }

          if (isAuthenticatedPayload(decoded)) {
            resolve({ userId: decoded.userId, name: decoded.name, isAdmin: decoded.isAdmin })
          } else {
            reject(new Error('Authentication failed: token verify error'))
          }
        })
      })
    }

    throw new Error('Authentication failed: bearer header not found.')
  }
}

function isAuthenticatedPayload(decoded: string | JwtPayload | undefined): decoded is JwtPayload & AuthenticatedUserPayload {
  return typeof decoded === 'object' && decoded !== null && decoded.userId !== undefined && decoded.name !== undefined
}

export default AuthenticationService
