export function generate12CharId(length:number = 4) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < length; i++) {
      const randomChar = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      id += randomChar;
    }
    return id;
}
  