import { Adapter } from "next-auth/adapters";
import { Pool } from "pg";

export default function PostgresAdapter(client: Pool, options = {}): Adapter {
  return {
    async createUser(user) {
      try {
        const sql = `
        INSERT INTO users (name, email, email_verified, image) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, email, email_verified, image`;
        let result = await client.query(sql, [user.name, user.email, user.emailVerified, user.image]);
        return result.rows[0];
      } catch (err) {
        console.log(err);
        return;
      }
    },
    async getUser(id) {
      try {
        const sql = `select * from users where id = $1`;
        let result = await client.query(sql, [id]);
        return result.rows[0];
      } catch (err) {
        console.log(err);
        return;
      }
    },
    async getUserByEmail(email) {
      try {
        const sql = `select * from users where email = $1`;
        let result = await client.query(sql, [email]);
        return result.rows[0];
      } catch (err) {
        console.log(err);
        return;
      }
    },
    async getUserByAccount({ providerAccountId, provider }) {
      try {
        const sql = `
          select u.* from users u join accounts a on u.id = a.user_id 
          where 
          a.provider_id = $1 
          and 
          a.provider_account_id = $2`;

        const result = await client.query(sql, [provider, providerAccountId]);
        return result.rows[0];
      } catch (err) {
        console.log(err);
      }
    },
    async updateUser(partialUser) {
      try {
        const sql = `select * from users where id=$1`
        const result = await client.query(sql, [partialUser?.id])
        return result.rows[0];
      } catch (err) {
        console.log(err);
        return;
      }
    },
    async linkAccount(account) {
      try {
        const sql = `
        insert into accounts 
        (
          user_id, 
          provider_id, 
          provider_type, 
          provider_account_id, 
          access_token,
          access_token_expires
        )
        values ($1, $2, $3, $4, $5, to_timestamp($6))`;

        const params = [
          account.userId,
          account.provider,
          account.type,
          account.providerAccountId,
          account.access_token,
          account.expires_at,
        ];

        await client.query(sql, params);
        return account;
      } catch (err) {
        console.log(err);
        return;
      }
    },
    //@ts-ignore
    async createSession({ sessionToken, userId, expires }) {
      try {
        const sql = `insert into sessions (user_id, expires, session_token) values ($1, $2, $3)`;
        await client.query(sql, [userId, expires, sessionToken]);
        return { sessionToken, userId, expires };
      } catch (err) {
        console.log(err);
        return;
      }
    },
    //@ts-ignore
    async getSessionAndUser(sessionToken) {
      try {
        let result;
        result = await client.query("select * from sessions where session_token = $1", [sessionToken]);

        let session = result.rows[0];

        result = await client.query("select * from users where id = $1", [session.user_id]);
        let user = result.rows[0];

        return {
          session,
          user,
        };
      } catch (err) {
        console.log(err);
        return;
      }
    },
    //@ts-ignore
    async updateSession({ sessionToken }) {
      return;
    },
    async deleteSession(sessionToken) {
      try {
        const sql = `delete from sessions where session_token = $1`;
        await client.query(sql, [sessionToken]);
      } catch (err) {
        console.log(err);
        return;
      }
    },
    async createVerificationToken({ identifier, expires, token }) {
      try{
        const sql = `insert into verification_requests (identifier, expires, token) values ($1, $2, $3)`;
        await client.query(sql, [identifier, expires, token]);
        return { identifier, expires, token };
      } catch (err) {
        console.log(err);
        return;
      }
    },
    async useVerificationToken({ identifier, token }) {
      try {
        const sql = `
          select * from verification_requests
          where 
          identifier = $1 
          and 
          token = $2`;

        const result = await client.query(sql, [identifier, token]);
        if (!result) return null;

        // const data = result.rows[0];
        // const sql1 = `
        //   delete from verification_requests
        //   where 
        //   identifier = $1 
        //   and 
        //   token = $2`;

        // await client.query(sql1, [identifier, token]);
        return result.rows[0];
        
      } catch (err) {
        console.log(err);
        return false;  
      }
    },
  };
}
