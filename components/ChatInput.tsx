'use client';

import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { addDoc, collection, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { db } from "../firebase";
import ModelSelection from "./ModelSelection";
import useSWR from "swr";
import { useCollection } from "react-firebase-hooks/firestore";
import {conn} from "../firebaseAdmin";

type Props = {
    chatId: string;
};

function ChatInput({chatId}: Props) {
  const [prompt, setPrompt] = useState("");
  const [chatgptrespond, setChatGPTRespond] = useState(false);
  const {data: session} = useSession();
  
  const { data: model } = useSWR('model', {
    fallbackData: 'gpt-3.5-turbo-0301'
  })

  const sendMessage = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt) return;

    const input = prompt.trim();
    setPrompt("");

    const message: Message = {
      text: input,
      createdAt: serverTimestamp(),
      user: {
        _id: session?.user?.email!,
        name: session?.user?.email!,
        avatar: session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.email}`,
      }
    }

    // await addDoc(
    //   collection(db, 'users', session?.user?.email!, "chats", chatId, "messages"), 
    //   message
    // )
    

    await fetch('/api/sendMessage', {method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id: chatId, message }),
    })

    const notification = toast.loading("ChatGPT is thinking...");
    
    // Toast notification
    await fetch('/api/askQuestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: input, 
        // prevmes: messages,
        chatId, 
        model, 
        session 
      }),
    }).then(() => {
      // Toast notification to say sucessful!
      toast.success('ChatGPT has responded!', {
        id: notification,
      });
      setChatGPTRespond(true);
    });
  }

  return (
    <div className="bg-gray-700/50 text-gray-400 rounded-lg text-sm">
        <form onSubmit={sendMessage} className="p-5 space-x-5 flex">
            <input 
              className="bg-transparent focus:outline-none flex-1
               disabled:cursor-not-allowed disabled:text-gray-300"
              disabled={!session}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              type="text" 
              placeholder="Type your message here..." />

            <button disabled={!prompt || !session || !chatgptrespond} type="submit"
              className="bg-[#11A37F] hover:opacity-50 
              text-white font-bold px-4 py-2 rounded 
              disabled:bg-gray-300 disabled:cursor-not-allowed"  
            >
                <PaperAirplaneIcon className="h-4 w-4 -rotate-45" />
            </button>
        </form>

        <div className="md:hidden">
          <ModelSelection />
        </div>
    </div>
  )
}

export default ChatInput