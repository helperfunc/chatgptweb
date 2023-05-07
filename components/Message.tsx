import { DocumentData } from "firebase/firestore";
import ReactMarkdown from 'react-markdown'

type Props = {
    message: DocumentData;
}
function Message({ message }: Props) {
  const isChatGPT = message.user_email === "ChatGPT"
  let avatar = isChatGPT ? `https://i.ibb.co/3d0yRBC/borromean-knot-removebg-preview.png`: `https://ui-avatars.com/api/?name=${message.user_email}`
  return (
    // <div className={`py-5 text-white ${isChatGPT && "bg-[#434654]"}`}>
    //     <div className="flex space-x-5 px-10 max-w-2xl mx-auto">
    //         <img src={message.user.avatar} alt="" className="h-8 w-8" />
    //         <p className="pt-1 text-sm">{message.text}</p>
    //     </div>
    // </div>
    <div className={`py-5 text-white ${isChatGPT && "bg-[#434654]"}`}>
        <div className="flex space-x-5 px-10 max-w-2xl mx-auto">
            <img src={avatar} alt="" className="h-8 w-8" />
            <ReactMarkdown className="pt-1 text-sm">{message.content}</ReactMarkdown>
        </div>
    </div>
  )
}

export default Message