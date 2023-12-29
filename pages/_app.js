// pages/_app.js
import '../styles/styles.css'; // Import the global CSS here

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
