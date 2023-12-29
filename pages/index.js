import React, { useState } from 'react';
import SearchResults from '../components/SearchResults';
import AudioPlayer from '../components/AudioPlayer';
import Head from 'next/head'; // Import the Head component

const Home = () => {
  const [results, setResults] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  const handleSearch = async (query) => {
    try {
      const response = await fetch(`/api/search?query=${query}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Head>
        <title>LTunes</title> {/* Set the title of your website */}
        <link rel="icon" href="https://secure4.ltunes.gq/icons/favicon-32x32.png" /> {/* Add the path to your favicon */}
      </Head>
      <center><br></br>
      <SearchResults results={results} />
      {selectedVideoId && <AudioPlayer videoId={selectedVideoId} />}
      </center>
    </div>
  );
};

export default Home;
