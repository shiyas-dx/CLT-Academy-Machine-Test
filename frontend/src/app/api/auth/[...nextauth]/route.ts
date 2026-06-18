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
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const apiBase = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000';
          // 1. Try to login
          const res = await fetch(`${apiBase}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });

          if (res.ok) {
            const data = await res.json();
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              token: data.accessToken,
            };
          }

          // 2. Auto-register new users if they don't exist
          if (res.status === 401) {
            const regRes = await fetch(`${apiBase}/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: credentials.email.split('@')[0],
                email: credentials.email,
                password: credentials.password
              }),
            });
            if (regRes.ok) {
              const loginRes = await fetch(`${apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: credentials.email, password: credentials.password }),
              });
              if (loginRes.ok) {
                const data = await loginRes.json();
                return {
                  id: data.user.id,
                  name: data.user.name,
                  email: data.user.email,
                  token: data.accessToken,
                };
              }
            }
          }
        } catch (error) {
          console.error("Authorize error:", error);
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google') {
          try {
            const apiBase = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000';
            const res = await fetch(`${apiBase}/auth/google-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email, name: user.name }),
            });
            if (res.ok) {
              const data = await res.json();
              token.id = data.user.id;
              token.accessToken = data.accessToken;
            } else {
              token.id = user.id;
              token.accessToken = "google-mock-token";
            }
          } catch (e) {
            console.error("Google login exchange error:", e);
            token.id = user.id;
            token.accessToken = "google-mock-token";
          }
        } else {
          token.id = user.id;
          token.accessToken = (user as any).token;
        }
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
