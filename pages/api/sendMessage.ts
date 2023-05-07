// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { conn } from '../../firebaseAdmin';

type Data = {
  id: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id, message } = req.body;
  if (message.user.name === 'ChatGPT') {
    let sql_users = `INSERT INTO users (name, email, image) VALUES ($1, $2, $3) on conflict (email) do nothing`
    let users_result = await conn.query(sql_users, [message.user.name, message.user.name, message.user.avatar]);
  }
  const sql_message = `INSERT INTO messages (chat_id, user_email, content) VALUES ($1, $2, $3) RETURNING id`
  let result = await conn.query(sql_message, [id, message.user.name, message.text])
  let returned = result.rows[0]
  res.status(200).json({ id: returned.id })
}
