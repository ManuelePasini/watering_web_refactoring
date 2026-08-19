export class UserTokenRequest {
  email: string
  password: string

  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }
}

export class UserTokenResponse {
  token: string

  constructor(token: string) {
    this.token = token
  }
}
