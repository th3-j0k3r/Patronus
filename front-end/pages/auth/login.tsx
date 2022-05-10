import type { GetServerSideProps, NextPage } from 'next';
import type { ClientSafeProvider } from 'next-auth/client';
import { getProviders, getSession, signIn } from 'next-auth/client';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Fragment, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { MdLogin } from 'react-icons/md';
import LoadingSpinner from '../../components/shared/animation/loading-spinner';

interface LoginPageProps {
  providers: Record<string, ClientSafeProvider> | null;
  session: undefined;
}

const LoginPage: NextPage<LoginPageProps> = ({ providers }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { query } = useRouter();

  function handleAuthRedirect() {
    const providerId = providers?.google.id;
    setIsLoading(true);

    signIn(providerId, {
      callbackUrl: `${process.env.NEXT_PUBLIC_AUTH_CALLBACK}${query.redirectTo}`,
      redirect: true,
    });
  }

  return (
    <Fragment>
      <Head>
        <title>Patronus | Auth</title>
      </Head>
      <div className="flex flex-col justify-center items-center w-screen h-screen  bg-no-repeat bg-cover bg-opacity-50 bg-login-gr">
        <Image
          src="/logo.png"
          layout="fixed"
          width={120}
          height={60}
          priority
          alt="..."
        />

        <div className="sm:w-96 h-52 w-11/12 max-w-sm bg-gray-100 bg-opacity-50 shadow-2xl rounded-xl mt-7">
          <div className="flex flex-col justify-center items-center h-full w-full">
            <MdLogin fontSize={40} color="#fff" />
            <button
              onClick={handleAuthRedirect}
              className="mt-6 pt-2 pb-2 px-4 py-4 bg-white hover:scale-105 hover:bg-opacity-100 transform transition-all rounded-md flex items-center justify-between shadow-2xl"
            >
              {isLoading ? (
                <LoadingSpinner className="h-5 w-5 border-black" />
              ) : (
                <FcGoogle fontSize={20} />
              )}
              <span className="ml-3 text-black">{'Sign in with Google'}</span>
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  const providers = await getProviders();

  if (session) {
    return {
      props: { session: session },
      redirect: {
        destination: '/',
        statusCode: 301,
      },
    };
  }

  return {
    props: { session: session, providers },
  };
};
