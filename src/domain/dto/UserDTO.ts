export interface CreateUserDTO {
  name: string;
  email: string;
  password: string; // Senha sem o hash
}