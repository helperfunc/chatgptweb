// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { conn } from '../../firebaseAdmin';

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {id} = req.body;
  const sql = `delete from chats where id = $1`;
  await conn.query(sql, [id]);
  res.status(200).json({ name: 'John Doe' })
}
