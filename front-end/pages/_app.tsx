import { Provider } from 'next-auth/client';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import type { FC } from "react";
import { useEffect } from 'react';
import AppleTouchIconsMeta from '../components/pwa/apple-touch-icons';
import { useServiceWorker } from '../hooks/useServiceWorker';
import Layout from '../layout';
import '../styles/globals.css';
import '../styles/nprogress.css';

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  useServiceWorker();

  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
    };
    const handleStop = () => {
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  return (
    <Provider session={pageProps.session}>
      <Head>
        <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />
        <title>Patronus</title>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <AppleTouchIconsMeta />
      <Layout session={pageProps.session}>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  );
};

export default App;
