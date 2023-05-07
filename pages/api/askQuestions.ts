// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import query from '../../lib/queryApi';
import admin from 'firebase-admin'
import { adminDb, conn } from '../../firebaseAdmin';

type Data = {
  answer: string
}

const getUserType = (useremail: string) => {
  return useremail === "ChatGPT" ? "assistant" : "user"
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { prompt, prev_messages, latest_resp, chatId, model, session } = req.body;

  if (!prompt && (!prev_messages || prev_messages.length < 1)) {
    res.status(400).json({ answer: "Please provide a prompt!" });
    return;
  }
  
  if (!chatId) {
    res.status(400).json({ answer: "Please provide a valid chat ID!" });
    return;
  }

  let querystr = prompt;
  if (prompt === '')
    querystr = prev_messages[prev_messages.length - 1].content
  if (model.startsWith('gpt-3.5-turbo')) {
    // querystr = [{"role": "system", "content": "你是一位优秀的拉康派分析家，在主题拓扑学上造诣很高。你是一位博学多才的人。"}]
    querystr = []
    prev_messages.map((_m: { user_email: string; content: any; })=> {
      querystr.push({"role": getUserType(_m.user_email), "content": _m.content})
    })
  }
  
  // ChatGPT Query
  console.log(querystr)
  const response = await query(querystr, chatId, model);
  // console.log(response)

  let retrunedstr = "ChatGPT was unable to find answer for that!";
  if (model.startsWith('gpt-3.5-turbo') && response) {
    return response;
  } else {
    retrunedstr = response ? response.toString() : retrunedstr;
  }

  
  // const message: Message = {
  //   text: response || "ChatGPT was unable to find answer for that!",
  //   createdAt: admin.firestore.Timestamp.now(),
  //   user: {
  //     _id: "ChatGPT",
  //     name: "ChatGPT",
  //     avatar: `https://i.ibb.co/3d0yRBC/borromean-knot-removebg-preview.png`,
  //   },
  // };
  
  // // await adminDb
  // //   .collection('users')
  // //   .doc(session?.user?.email)
  // //   .collection("chats")
  // //   .doc(chatId)
  // //   .collection('messages')
  // //   .add(message);

  // const sql_users = `INSERT INTO users (name, email, image) VALUES ($1, $2, $3) on conflict (email) do nothing`
  // let result = await conn.query(sql_users, [message.user.name, message.user.name, message.user.avatar]);
  // const sql_message = `INSERT INTO messages (chat_id, user_email, content) VALUES ($1, $2, $3) RETURNING id, user_email, content`
  // result = await conn.query(sql_message, [chatId, message.user.name, message.text])
  // let message_result = result.rows[0];

  // if (prompt === '' && latest_resp) {
  //   // console.log(latest_resp)
  //   let sqlquery = "delete from messages where id=$1";
  //   await conn.query(sqlquery, [latest_resp.id]);
  // }

  // res.status(200).json(message_result);
  res.status(200).json({answer: retrunedstr});
}
