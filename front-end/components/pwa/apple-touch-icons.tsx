import Head from 'next/head';

const AppleTouchIconsMeta = () => {
  return (
    <Head>
      <link
        rel="apple-touch-icon"
        href="/assets/apple-touch-icon-iphone-60x60.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="60x60"
        href="/assets/apple-touch-icon-ipad-76x76.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="114x114"
        href="/assets/apple-touch-icon-iphone-retina-120x120.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="144x144"
        href="/assets/apple-touch-icon-ipad-retina-152x152.png"
      />
      <link rel="apple-touch-icon" href="/favicon.png" />
    </Head>
  );
};

export default AppleTouchIconsMeta;
