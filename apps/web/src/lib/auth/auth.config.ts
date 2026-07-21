export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: { user?: unknown } | null; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

      if (isOnDashboard) return isLoggedIn;
      if (isOnAuth && isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
      return true;
    },
  },
  providers: [],
};
