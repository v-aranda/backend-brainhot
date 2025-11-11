// src/domain/errors/DomainError.ts
export class DomainError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'DomainError';
    this.statusCode = statusCode;
  }
}