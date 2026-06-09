import bcrypt from "bcryptjs";
import type { User } from "src/module/user/user.type";
import { executeQuery } from "src/db";

export const findUser = async ({
  id,
  username,
}: {
  id?: number;
  username?: string;
}): Promise<User | null> => {
  try {
    const condition = id ? "id = @id" : "username = @username";

    const query = `
      SELECT id, username, name, password, department, role FROM users
      WHERE ${condition}
    `;

    const result = await executeQuery(query, [
      ...(id != null ? [{ name: "id", type: undefined, value: id }] : []),
      ...(username != null ? [{ name: "username", type: undefined, value: username }] : []),
    ]);

    return result.recordset[0] ?? null;
  } catch (error) {
    console.error("findUser", error);
    throw error;
  }
};

export const verifyPassword = async (
  username: string,
  password: string,
): Promise<User | null> => {
  try {
    const user = await findUser({ username });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      return null;
    }

    delete user.password;
    return user;
  } catch (error) {
    console.error("verifyPassword", error);
    throw error;
  }
};
