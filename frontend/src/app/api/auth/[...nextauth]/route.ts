import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Keeping mock login active for testing, but real auth can be connected here
        if (credentials?.email) {
          return { id: "1", name: "Test User", email: credentials.email, token: "mock-jwt-token" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // If logged in via Google, we generate a mock token for the backend connection
        token.accessToken = account?.provider === 'google' ? "google-mock-token" : (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
});

export { handler as GET, handler as POST };
