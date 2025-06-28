
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "AtCoder",
      credentials: {
        atcoderId: { label: "AtCoder ID", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // ここでAtCoderのログイン処理を実装します
        // ダミー実装として、入力があればユーザー情報を返します
        if (credentials?.atcoderId && credentials?.password) {
          return { id: credentials.atcoderId, name: credentials.atcoderId }
        } else {
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  }
})

export { handler as GET, handler as POST }
