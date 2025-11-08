import { randomUUID } from "crypto";
import { isValidEmail } from "../../utils/isValidEmail";


interface UserProps {
  id?: string;
  name: string;
  email: string;
  passwordhash: string;
  createdAt?: Date;
}

export class User {
  public readonly id: string;
  public name: string;
  public email: string;
  public passwordhash: string;
  public readonly createdAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id ?? randomUUID();
    this.name = props.name;
    this.email = props.email;
    this.passwordhash = props.passwordhash;
    this.createdAt = props.createdAt ?? new Date();
  }

  public static create(props: UserProps): User {
    if (!props.name || props.name.trim().length === 0) {
      // No futuro, podemos criar Erros customizados.
      // Por enquanto, um Error padrão é suficiente.
      throw new Error("User name is required.");
    }

    // 2. Regra: Email deve ser válido
    if (!props.email || !isValidEmail(props.email)) {
      throw new Error("User email is invalid.");
    }

    // 3. Regra: Senha (hash) é obrigatória
    if (!props.passwordhash) {
      throw new Error("Password hash is required.");
    }
    return new User(props);
  }
}
