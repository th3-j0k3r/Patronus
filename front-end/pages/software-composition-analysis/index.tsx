import type { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/client';
import Head from 'next/head';
import FadeTransition from '../../components/shared/animation/fade-transition';
import SectionTitle from '../../components/shared/section-heading';
import SCAView from '../../screens/software-composition-analysis';
import type { BasePageProps } from '../../types';

const SoftwareCompositionAnalysisPage: NextPage<BasePageProps> = (props) => {
  return (
    <FadeTransition>
      <Head>
        <title>Patronus | Software Composition Analysis</title>
      </Head>
      <SectionTitle title="Software Composition Analysis" showDivider={true} />
      <SCAView />
    </FadeTransition>
  );
};

export default SoftwareCompositionAnalysisPage;

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
