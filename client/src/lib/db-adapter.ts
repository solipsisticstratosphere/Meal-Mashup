import { Pool, PoolClient, PoolConfig } from "pg";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { Adapter, AdapterUser, AdapterSession } from "next-auth/adapters";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "./.env" });
}

const dbConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  ssl:
    process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false,
};

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    const isCloudflare = typeof globalThis.caches !== "undefined";

    if (isCloudflare) {
      console.log("Using Cloudflare-compatible PostgreSQL connection");

      (async () => {})();
    } else {
      console.log("Using standard PostgreSQL connection");
    }

    pool = new Pool(dbConfig);

    pool.on("error", (err: Error) => {
      console.error("Unexpected error on idle client", err);
      if (process.env.NODE_ENV !== "production") {
        process.exit(-1);
      }
    });
  }

  return pool;
}

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export const CustomAdapter = (): Adapter => {
  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const { name, email, image } = user;

      const result = await query<AdapterUser>(
        `INSERT INTO users (name, email, image_url, role, password) 
        VALUES ($1, $2, $3, 'user', '') 
        RETURNING id, name, email, image_url as image, role, created_at as "emailVerified"`,
        [name, email, image]
      );

      return result[0];
    },

    async getUser(id) {
      const users = await query<AdapterUser>(
        `SELECT id, name, email, image_url as image, role, created_at as "emailVerified" 
        FROM users WHERE id = $1`,
        [id]
      );

      return users[0] || null;
    },

    async getUserByEmail(email) {
      const users = await query<AdapterUser>(
        `SELECT id, name, email, image_url as image, role, created_at as "emailVerified" 
        FROM users WHERE email = $1`,
        [email]
      );

      return users[0] || null;
    },

    async getUserByAccount() {
      return null;
    },

    async updateUser(user) {
      const { id, name, email, image } = user;

      const result = await query<AdapterUser>(
        `UPDATE users 
        SET name = $2, email = $3, image_url = $4, updated_at = now() 
        WHERE id = $1 
        RETURNING id, name, email, image_url as image, role, created_at as "emailVerified"`,
        [id, name, email, image]
      );

      return result[0];
    },

    async deleteUser(userId) {
      await query(`DELETE FROM users WHERE id = $1`, [userId]);
      return;
    },

    async createSession(session) {
      const sessionToken = session.sessionToken || uuidv4();
      const userId = session.userId;
      const expires = session.expires;
      const id = uuidv4();

      const result = await query<AdapterSession>(
        `INSERT INTO sessions (id, user_id, session_token, expires) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, session_token as "sessionToken", user_id as "userId", expires`,
        [id, userId, sessionToken, expires]
      );

      return result[0];
    },

    async getSessionAndUser(sessionToken) {
      const result = await query<{
        sessionId: string;
        sessionToken: string;
        userId: string;
        expires: Date;
        id: string;
        name: string;
        email: string;
        image: string | null;
        role: string;
        emailVerified: Date;
      }>(
        `SELECT 
          s.id as "sessionId", 
          s.session_token as "sessionToken", 
          s.user_id as "userId", 
          s.expires,
          u.id, 
          u.name, 
          u.email, 
          u.image_url as image, 
          u.role,
          u.created_at as "emailVerified"
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = $1 AND s.expires > NOW()`,
        [sessionToken]
      );

      if (result.length === 0) {
        return null;
      }

      const {
        sessionId,
        sessionToken: token,
        userId,
        expires,
        ...user
      } = result[0];

      return {
        session: {
          id: sessionId,
          sessionToken: token,
          userId,
          expires,
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
          role: user.role,
        },
      };
    },

    async updateSession(session) {
      const { sessionToken, expires } = session;

      const result = await query<AdapterSession>(
        `UPDATE sessions 
        SET expires = $2
        WHERE session_token = $1
        RETURNING id, session_token as "sessionToken", user_id as "userId", expires`,
        [sessionToken, expires]
      );

      return result[0] || null;
    },

    async deleteSession(sessionToken) {
      await query(`DELETE FROM sessions WHERE session_token = $1`, [
        sessionToken,
      ]);
      return;
    },

    async createVerificationToken() {
      return null;
    },

    async useVerificationToken() {
      return null;
    },

    async linkAccount() {
      return null;
    },

    async unlinkAccount() {
      return;
    },
  };
};

export async function healthCheck(): Promise<boolean> {
  try {
    await query("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

export async function createRefreshToken(
  userId: string,
  expiresAt: Date,
  token: string = uuidv4()
): Promise<string> {
  try {
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );

    return token;
  } catch (error) {
    console.error("Error creating refresh token:", error);
    throw error;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<string | null> {
  try {
    const tokens = await query<{ user_id: string }>(
      `SELECT user_id FROM refresh_tokens
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );

    if (tokens.length === 0) {
      return null;
    }

    return tokens[0].user_id;
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    return null;
  }
}

export async function deleteRefreshToken(token: string): Promise<void> {
  try {
    await query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
  } catch (error) {
    console.error("Error deleting refresh token:", error);
  }
}
