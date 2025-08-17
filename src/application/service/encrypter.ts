export interface Encrypter {
  sign(payload: string): Promise<string>;
  verify(token: string): Promise<string>;
}
