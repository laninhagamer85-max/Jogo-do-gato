import { deleteUser, sendPasswordResetEmail, type Auth, type User } from "firebase/auth";

export async function requestPlayerPasswordReset(user: User, auth: Auth) {
  if (!user.email || !user.providerData.some(provider => provider.providerId === "password")) {
    throw new Error("Esta conta usa um provedor externo. Altere a senha diretamente nesse provedor.");
  }
  await sendPasswordResetEmail(auth, user.email);
}

/** Delete only after Firebase accepts the request. Never remove another account's save. */
export async function deletePlayerAccount(
  user: User, confirmation: string, saveKey: string,
  storage: Pick<Storage, "length" | "key" | "removeItem">,
  removeUser: (user: User) => Promise<void> = deleteUser,
) {
  if (confirmation.trim() !== "EXCLUIR") throw new Error("Digite EXCLUIR para confirmar.");
  await removeUser(user);
  try {
    const keys = [saveKey];
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (key === `${saveKey}-archive` || key?.startsWith(`${saveKey}-archive-`)) keys.push(key);
    }
    keys.forEach(key => storage.removeItem(key));
  } catch { /* Match published behavior if browser storage is unavailable. */ }
}
