declare namespace Express {
  export interface Request {
    // Anexamos o ID do usuário logado aqui
    user?: User;
  }
}