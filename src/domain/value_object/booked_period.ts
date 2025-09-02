export class BookedPeriod {
  constructor(
    public readonly start: Date,
    public readonly end: Date,
  ) {
    Object.freeze(this);
  }
}
