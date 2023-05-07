'use client';

import { useSession } from "next-auth/react";
import { collection, DocumentData, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebase";
import Message from "./Message";
import { ArrowDownCircleIcon, PaperAirplaneIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {conn} from "../firebaseAdmin"
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ModelSelection from "./ModelSelection";
import useSWR from "swr";
import { usePathname, useRouter } from "next/navigation";

type Props = {
    chatId: string;
};

function Chat({chatId}: Props) {
  const { data: session } = useSession();

  // const [messages] = useCollection(session && query(
  //   collection(db, "users", session?.user?.email!, "chats", chatId, "messages"),
  //   orderBy("createdAt", "asc")
  // ));
  
  const [messages, setMessages] = useState<any[]>([]);
  const [resultget, setResultGet] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatgptrespond, setChatGPTRespond] = useState(true);
  const [verified, setVerified] = useState([])
  const pathname = usePathname();
  const router = useRouter();

  const { data: model } = useSWR('model', {
    fallbackData: 'gpt-3.5-turbo-0301'
  })

  const sendMessage = async(e: any, type='create') => {
    setChatGPTRespond(false)
    e.preventDefault();
    // if (!prompt) return;

    let input = prompt.trim();
    if (type === 'regenerate') 
      input = ''
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
    let tmpuserchatid = {id: ''}
    let latest_resp = ''
    let req_messages = []
    if (input === '' && messages.length > 3 && messages[messages.length - 1].user_email === 'ChatGPT')
      req_messages = messages.slice(-4)
    else if (input === '' && messages.length > 2)
      req_messages = messages.slice(-3)
    else if (messages.length > 1)
      req_messages = messages.slice(-2)
    else if (messages.length > 0)
      req_messages = messages.slice(-1)

    if (input !== '') {
      tmpuserchatid = await fetch('/api/sendMessage', {method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: chatId, message }),
      }).then((res) => res.json())
      setMessages([...messages, {'id': tmpuserchatid.id, 'user_email': message.user.name, 'content': message.text}])
      req_messages.push({'id': tmpuserchatid.id, 'user_email': message.user.name, 'content': message.text})
    } else {
      if(messages[messages.length - 1].user_email === 'ChatGPT') {
        latest_resp = messages[messages.length - 1]
        messages.pop()
        req_messages.pop()
      }
      setMessages([...messages])
    }
    
    
    const notification = toast.loading("ChatGPT is thinking...");
    // Toast notification
    const resp_gpt = await fetch('/api/askQuestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: input, 
        prev_messages: req_messages,
        latest_resp: latest_resp,
        chatId, 
        model, 
        session 
      }),
    }).then((res) => {
      // Toast notification to say sucessful!
      toast.success('ChatGPT has responded!', {
        id: notification,
      });
      setChatGPTRespond(true);
      return res.json()
    });

    if (model === 'gpt-3.5-turbo') {
      const data = resp_gpt.body;
      if (!data) {
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let tmp_resp_gpt = ''
      let no_chagpt_res = true
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        // setGeneratedBios((prev) => prev + chunkValue);
        tmp_resp_gpt += chunkValue
        no_chagpt_res = false
        if (messages[messages.length - 1].user_email !== 'ChatGPT') {
          let resp_gpt = {'id': 'new-chatgpt-output', 'user_email': 'ChatGPT', 'content': tmp_resp_gpt}
          if (input !== '')
            setMessages(messages.concat([{'id': tmpuserchatid.id, 'user_email': message.user.name, 'content': message.text}, resp_gpt]))
          else
            setMessages(messages.concat([resp_gpt]))
        }
        else {
          messages[messages.length - 1].content = tmp_resp_gpt
          setMessages(messages)
        }
      }

      if (messages[messages.length - 1].user_email === 'ChatGPT') {
        const message: Message = {
          text: tmp_resp_gpt || "ChatGPT was unable to find answer for that!",
          createdAt: "",
          user: {
            _id: "ChatGPT",
            name: "ChatGPT",
            avatar: `https://i.ibb.co/3d0yRBC/borromean-knot-removebg-preview.png`,
          },
        };
        const tmpchatgptchatid = await fetch('/api/sendMessage', {method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ id: chatId, message }),
        }).then((res) => res.json())
        messages[messages.length - 1].id = tmpchatgptchatid.id
        setMessages(messages)
      }
    } else {
      if (input !== '')
        setMessages(messages.concat([{'id': tmpuserchatid.id, 'user_email': message.user.name, 'content': message.text}, resp_gpt]))
      else
        setMessages(messages.concat([resp_gpt]))
    }
  }


  const getMessages = async() => {
    await fetch('/api/getMessages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id:chatId, session}),
    }).then((res) => res.json())
    .then((data) => {
      setMessages(data)
      setResultGet(true)
    });
  }


  const verifyChat = async() => {
    await fetch('/api/verifyChat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id:chatId, session}),
    }).then((res) => res.json())
    .then((data) => {
      setVerified(data)
    });
  }

  useEffect(() => {
    if (!resultget && session) getMessages()
    if (session) verifyChat()
  }, [])

  return (
    <>
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {/* {messages?.empty && (
        <>
          <p className="mt-10 text-center text-white">
            Type a prompt in below to get started!
          </p>
          <ArrowDownCircleIcon className="h-10 w-10 mx-auto mt-5 text-white animate-bounce" />
        </>
      )}
      
      {messages?.docs.map((message) => (
        <Message key={message.id} message={message.data()} />
      ))} */}
      {messages?.length === 0 && verified?.length !== 0 && 
        <>
          <p className="mt-10 text-center text-white">
            Type a prompt in below to get started!
          </p>
          <ArrowDownCircleIcon className="h-10 w-10 mx-auto mt-5 text-white animate-bounce" />
        </>
      }
      {verified?.length !== 0 && messages?.map((message: DocumentData) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
    {messages?.length > 1 && chatgptrespond &&
    <div className="flex justify-center">
    <div className='flex flex-nowrap justify-center items-center w-fit space-x-2 px-4 py-3 rounded-full cursor-pointer transition-all duration-200
    hover:bg-gray-100 group'>
      <ArrowPathIcon className="flex overflow-x-auto h-8 w-8 cursor-pointer
      text-chatgpt transition-all duration-500 ease-out
      hover:rotate-180 active:scale-125 text-center" onClick={(e) => sendMessage(e, 'regenerate')} />
      <div className="flex overflow-x-auto items-center text-white group-hover:text-chatgpt">Regenerate response</div>
    </div>
    </div>
    }
    {verified?.length !== 0 && <div className="bg-gray-700/50 text-gray-400 rounded-lg text-sm">
        <div>
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
        </div>
        <div className="md:hidden">
          <ModelSelection />
        </div>
      </div>
    }
    </> 
  )
}

export default Chat
