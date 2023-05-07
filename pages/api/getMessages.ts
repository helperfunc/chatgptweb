// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { conn } from '../../firebaseAdmin';

type Data = {
  id: string
  content: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data[]>
) {
  const { id, session } = req.body;
  let sqlquery = "select id, user_email, content from messages where chat_id=$1 and (user_email=$2 or user_email='ChatGPT') order by created_at asc";
  let messages_results = await conn.query(sqlquery, [id, session.user.email]);
  res.status(200).json(messages_results.rows)
}
