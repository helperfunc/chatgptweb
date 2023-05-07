import { PlusIcon } from "@heroicons/react/24/outline"
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"; // nextjs13
import { useState } from "react";
import { db } from "../firebase";
import { conn } from "../firebaseAdmin";

function NewChat() {
  const router = useRouter();
  const {data: session} = useSession();
  const [docid, setDocid] = useState('');
  const createNewChat = async() => {
    // const doc = await addDoc(
    //   collection(db, 'users', session?.user?.email!, 'chats'), {
    //     messages: [],
    //     userId: session?.user?.email!,
    //     createdAt: serverTimestamp()
    //   });
    // router.push(`/chat/${doc.id}`);
    
    const docid = await fetch('/api/createChats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({session}),
    }).then((res) => res.json());
    router.push(`/chat/${docid.id}`);
    window.location.reload();
  }

  return (
    <div onClick={createNewChat} className="border-gray-700 border chatRow">
        <PlusIcon className="h-4 w-4"/>
        <p>New Chat</p>
    </div>
  )
}

export default NewChat