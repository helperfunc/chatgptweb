'use client'

import NewChat from "./NewChat"
import { useSession, signOut } from "next-auth/react"
import { useCollection } from "react-firebase-hooks/firestore"
import { db } from "../firebase";
import { collection, orderBy, query } from "firebase/firestore";
import ChatRow from "./ChatRow";
import ModelSelection from "./ModelSelection";
import { conn } from "../firebaseAdmin";
import { useEffect, useState } from "react";

function SideBar() {
  const { data: session } = useSession();

  // const [chats, loading, error] = useCollection(
  //   session && query(
  //   collection(db, "users", session.user?.email!, "chats"),
  //   orderBy("createdAt", "asc")
  // ));

  type Data = {
    id: string
  }

  const [chats, setChats] = useState<Data[]>([]);
  const [called, setCalled] = useState(false);

  const getChats = async() => {
    const data = await fetch('/api/getChats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({session}),
    }).then((res) => res.json());
    setChats(data)
    setCalled(true)
  }

  useEffect(() => {
    if (session) getChats()
  }, [session])
  

  // setInterval(()=>{
  //   if (session?.user !== undefined) {
  //     fetch('/api/getChats', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({session}),
  //     }).then((res) => {
  //       return res.json()
  //     }).then((data) => {
  //       setChats(data)
  //     }).catch((e) => {
  //       console.log(e)
  //     });
  //   }
  // }, 20000);


  return (
    <div className="p-2 flex flex-col h-screen">
        <div className="flex-1">
            <NewChat />
            <div className="hidden sm:inline">
                <ModelSelection />
            </div>

            <div className="flex flex-col space-y-2 my-2">
              {/* {loading && (
                <div className="animate-pulse text-center text-white">
                  <p>Loading Chats...</p>
                </div>
              )} */}
              {!called && (
                <div className="animate-pulse text-center text-white">
                  <p>Loading Chats...</p>
                </div>
              )}
              {/* Map through the ChartRows */}
              {/* {chats?.docs.map(chat => (
                <ChatRow key={chat.id} id={chat.id} />
              ))} */}
              {chats.map(chat => (
                <ChatRow key={chat.id} id={chat.id} />
              ))}
            
            </div>
        </div>
        {session && 
          <img 
            onClick={() => signOut()}
            src={session.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.email}`} 
            alt="Profile Pic" 
            className="h-12 w-12 rounded-full cursor-pointer mx-auto mb-2 hover:opacity-50" />}
        
    </div>
  )
}

export default SideBar