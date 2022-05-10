import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/client';
import Head from 'next/head';
import FadeTransition from '../../components/shared/animation/fade-transition';
import StaticApplicationSecurityTestingView from '../../screens/static-application-security-testing';
import type { BasePageProps } from '../../types';

const StaticApplicationSecurityTestingPage: NextPage<BasePageProps> = (
  props,
) => {
  return (
    <FadeTransition>
      <Head>
        <title>Patronus | Static Application Security Testing</title>
      </Head>
      <StaticApplicationSecurityTestingView />
    </FadeTransition>
  );
};

export default StaticApplicationSecurityTestingPage;

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
