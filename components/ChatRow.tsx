import { ChatBubbleLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { collection, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebase";
import {conn} from "../firebaseAdmin";

type Props = {
  id: string;
};

function ChatRow({id}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [activate, setActive] = useState(false);

  // const [message] = useCollection(query(
  //   collection(db, "users", session?.user?.email!, 'chats', id, 'messages'),
  //   orderBy('createdAt', 'asc')
  // ))

  type Data = {
    id: string
    content: string
  }

  const [messages, setMessages] = useState<Data[]>([]);
  const [resultget, setResultGet] = useState(false);

  const getMessages = async() => {
    const messageres = await fetch('/api/getMessages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id:id, session}),
    }).then((res) => res.json());
    setMessages(messageres)
    setResultGet(true)
  }

  useEffect(() => {
    if (!resultget && session) getMessages()
  }, [])

  // setInterval(()=>{
  //   fetch('/api/getMessages', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ id:id}),
  //   }).then((res) => {
  //     return res.json()
  //   }).then((data) => {
  //     setMessages(data)
  //   }).catch((e) => {
  //     console.log(e)
  //   });
  // }, 2000);

  
  useEffect(() => {
    if (!pathname) return;
    
    setActive(pathname.includes(id));
  }, [pathname])

  const removeChat = async() => {
    // await deleteDoc(doc(db, 'users', session?.user?.email!, 'chats', id));
    await fetch('/api/deleteChats', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id:id}),
    }).then((res) => {router.replace("/"); window.location.reload();});
  }

  return (
    <Link href={`/chat/${id}`} className={`chatRow justify-center ${activate && "bg-gray-700/50"}`}>
      <ChatBubbleLeftIcon className="h-5 w-5" />
      <p className="flex-1 hidden md:inline-flex truncare">
        {/* {message?.docs[0]?.data().text || "New Chat"} */}
        {messages.length > 0 ? messages[0].content.slice(0,255) : "New Chat"}
      </p>
      <TrashIcon onClick={removeChat} className="h-5 w-5 text-gray-700 hover:text-red-700" />
    </Link>
    
  );
}

export default ChatRow