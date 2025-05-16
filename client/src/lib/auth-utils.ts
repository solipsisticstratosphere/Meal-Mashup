import bcrypt from "bcrypt";

/**
 *
 * @param password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 *
 * @param password Проверяемый пароль
 * @param hashedPassword Хешированный пароль из базы данных
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
