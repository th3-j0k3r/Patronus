import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorizationUrl:
        'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code',
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/auth/login',
  },
  session: { jwt: true },
  jwt: {
    encryption: true,
    secret: process.env.JWT_SECRET,
  },
  secret: process.env.SECRET,
  callbacks: {
    async jwt(token, account) {
      if (account?.accessToken) {
        token.accessToken = account.accessToken;
      }
      return token;
    },
    async signIn(_user, account, profile) {
      if (
        account.provider === 'google' &&
        profile.verified_email === true &&
        profile?.email?.endsWith('@') //org email address
      ) {
        return true;
      } else {
        return false;
      }
    },
    redirect: async (url, _baseUrl) => {
      return Promise.resolve(url);
    },
  },
});
