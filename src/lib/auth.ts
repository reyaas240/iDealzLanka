import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import AppleProvider from "next-auth/providers/apple"
import * as bcrypt from "bcryptjs"

type UserRole = "ADMIN" | "STAFF" | "CUSTOMER"

declare module "next-auth" {
  interface User {
    id: string
    role: UserRole
    image?: string | null
  }
  interface Session {
    user: {
      id: string
      role: UserRole
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    image?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline"
          }
        }
      })
    ] : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET ? [
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET
      })
    ] : []),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET ? [
      AppleProvider({
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET
      })
    ] : [])
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign in - manual account management
      if (account?.provider === 'google' || account?.provider === 'facebook' || account?.provider === 'apple') {
        // Check if user exists by email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email as string },
          include: { accounts: true }
        })

        if (existingUser) {
          // Check if this OAuth account is already linked
          const existingAccount = existingUser.accounts.find(
            (acc: any) => acc.provider === account?.provider && acc.providerAccountId === account?.providerAccountId
          )
          
          if (existingAccount) {
            // Account already linked
            user.id = existingUser.id
            user.role = existingUser.role
            return true
          }
          
          // User exists but this OAuth account is not linked
          // Link the OAuth account to the existing user
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state,
            }
          })
          
          // Set country if not set
          if (!existingUser.country) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { country: "Sri Lanka" }
            })
          }
          
          user.id = existingUser.id
          user.role = existingUser.role
          return true
        }

        // New user - create user and account
        const newUser = await prisma.user.create({
          data: {
            email: user.email as string,
            name: user.name || 'User',
            image: user.image || null,
            country: "Sri Lanka",
            role: 'CUSTOMER',
            accounts: {
              create: {
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              }
            }
          }
        })
        
        user.id = newUser.id
        user.role = newUser.role
        return true
      }

      // Allow credentials sign in
      return true
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after successful sign-in
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        if (user.image) token.image = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        if (token.image) session.user.image = token.image
      }
      return session
    }
  }
}
