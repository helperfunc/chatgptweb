'use client'
import { signIn } from "next-auth/react"
import Image from "next/image"

function Login() {
  return (
    <div className="bg-[#11A37F] h-screen flex flex-col items-center justify-center text-center">
        <Image 
            src="https://i.ibb.co/3d0yRBC/borromean-knot-removebg-preview.png"
            width={200}
            height={200}
            alt="logo"
        />
        <button onClick={() => signIn("google")} className="text-white font-bold text-3xl animate-pulse">
            Sign In to use ChatGPT
        </button>
    </div>
  )
}

export default Login