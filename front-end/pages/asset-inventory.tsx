import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/client';
import Head from 'next/head';
import FadeTransition from '../components/shared/animation/fade-transition';
import AssetInventoryView from '../screens/asset-inventory';
import type { BasePageProps } from '../types';

const AssetInventoryPage: NextPage<BasePageProps> = (props) => {
  return (
    <FadeTransition>
      <Head>
        <title>Patronus | Asset Inventory</title>
      </Head>
      <AssetInventoryView />
    </FadeTransition>
  );
};

export default AssetInventoryPage;

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
