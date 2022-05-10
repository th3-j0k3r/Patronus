import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/client';
import Head from 'next/head';
import FadeTransition from '../../components/shared/animation/fade-transition';
import SecretScanningView from '../../screens/secret-scanning';
import type { BasePageProps } from '../../types';

const SecretScanningPage: NextPage<BasePageProps> = (props) => {
  return (
    <FadeTransition>
      <Head>
        <title>Patronus | Secret Scanning</title>
      </Head>
      <SecretScanningView />
    </FadeTransition>
  );
};

export default SecretScanningPage;

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
