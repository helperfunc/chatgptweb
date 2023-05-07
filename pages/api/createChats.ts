// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { conn } from '../../firebaseAdmin';

type Data = {
  chat_id: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { session } = req.body;
  const sql_chats = `INSERT INTO chats (user_email) VALUES ($1) RETURNING id`;
  let result = await conn.query(sql_chats, [session?.user?.email]);
  let chatresult = result.rows[0];

  res.status(200).json({ chat_id: chatresult[0] })
}
