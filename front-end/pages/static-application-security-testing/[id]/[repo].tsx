import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/client';
import Head from 'next/head';
import FadeTransition from '../../../components/shared/animation/fade-transition';
import StaticApplicationSecurityTestingDetailView from '../../../screens/static-application-security-testing/detail';
import type { BasePageProps } from '../../../types';
import type { ScannedDetailViewProps } from '../../../types/globals';

const SASTDetailPage: NextPage<ScannedDetailViewProps> = ({ params }) => {
  return (
    <FadeTransition>
      <Head>
        <title>Patronus | Static Application Security Testing</title>
      </Head>
      <StaticApplicationSecurityTestingDetailView params={params} />
    </FadeTransition>
  );
};

export default SASTDetailPage;

export const getServerSideProps: GetServerSideProps<
  BasePageProps & ScannedDetailViewProps,
  {
    id: string;
    repo: string;
  }
> = async ({ req, resolvedUrl, params }) => {
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

  const id = params?.id;
  const repo = params?.repo;

  if (!id || !repo) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      session: session,
      params: { id, repo },
    },
  };
};
