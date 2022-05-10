import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/client';
import Head from 'next/head';
import FadeTransition from '../../components/shared/animation/fade-transition';
import OnDemandScanView from '../../screens/ondemand-scan';
import type { BasePageProps } from '../../types';

const OnDemandScanPage: NextPage<BasePageProps> = (props) => {
  return (
    <FadeTransition>
      <Head>
        <title>Patronus | On Demand Scan</title>
      </Head>
      <OnDemandScanView />
    </FadeTransition>
  );
};

export default OnDemandScanPage;

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
