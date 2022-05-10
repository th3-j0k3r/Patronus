import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/client';
import Head from 'next/head';
import FadeTransition from '../components/shared/animation/fade-transition';
import HomeView from '../screens/home';
import type { BasePageProps } from '../types';

const Home: NextPage<BasePageProps> = () => {
  return (
    <FadeTransition>
      <Head>
        <title>Patronus | Dashboard</title>
      </Head>
      <HomeView />
    </FadeTransition>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps<BasePageProps> = async ({
  req,
  resolvedUrl,
}) => {
  const session = await getSession({ req });

  if (!session) {
    return {
      props: {
        allAssets: null,
        session: null,
      },
      redirect: {
        destination: `/auth/login?redirectTo=${resolvedUrl}`,
        statusCode: 302,
      },
    };
  }

  return {
    props: {
      session: session,
    },
  };
};
