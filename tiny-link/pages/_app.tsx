import Head from "next/head";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <title>TinyLink</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
