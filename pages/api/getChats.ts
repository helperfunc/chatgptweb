// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { conn } from '../../firebaseAdmin';

type Data = {
  id: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data[]>
) {
  let {session} = req.body;
  const sqlquery = "select id from chats where user_email=$1 order by created_at asc";
  let results = await conn.query(sqlquery, [session.user.email]);
  res.status(200).json(results.rows)
}
