export type UserProps = {
  id: string;
  name: string;
  email: string;
};

export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
  }
}


