export class User {
  id?: number | null
  email: string
  password?: string | null
  name?: string | null

  constructor(id: number | null | undefined, email: string, name?: string | null, password?: string | null) {
    this.id = id
    this.email = email
    this.password = password
    this.name = name
  }
}
