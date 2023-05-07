import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import {conn} from "../../../firebaseAdmin"
import {adminDb} from "../../../firebaseAdmin"
import { FirestoreAdapter } from "@next-auth/firebase-adapter"
import PostgresAdapter  from "../../../lib/adapter"
import {Pool} from "pg"


export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_ID!,
    //   clientSecret: process.env.GOOGLE_SECRET!,
    // }),
    // Sign in with passwordless email link
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.SMTP_FROM,
    }),
    // ...add more providers here
  ],
  // adapter: FirestoreAdapter(adminDb),
  adapter: PostgresAdapter(conn),
  secret: process.env.SECRET,
}

export default NextAuth(authOptions)