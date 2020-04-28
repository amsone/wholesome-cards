export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
