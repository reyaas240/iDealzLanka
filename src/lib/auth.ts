import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"
import CredentialsProvider from "next-auth/providers/credentials"
import * as bcrypt from "bcryptjs"

type UserRole = "ADMIN" | "STAFF" | "CUSTOMER"

declare module "next-auth" {
  interface User {
    id: string
    role: UserRole
  }
  interface Session {
    user: {
      id: string
      role: UserRole
      name?: string | null
      email?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Password",
      credentials: {
        identifier: { label: "Email or Mobile", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        // Find user by email or mobile
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { mobile: credentials.identifier }
            ]
          }
        })

        if (!user) {
          console.log("User not found for identifier:", credentials.identifier)
          return null
        }

        if (!user.password) {
          console.log("User has no password set:", user.email)
          return null
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password)
        
        if (!isValidPassword) {
          console.log("Invalid password for user:", user.email)
          return null
        }

        console.log("Authentication successful for user:", user.email)
        return user
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  }
}
