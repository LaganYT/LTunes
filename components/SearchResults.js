import React, { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';
import axios from 'axios';
import { getAccessToken } from '../auth'; // Import the getAccessToken function
import stationsData from '../stations.json'; // Import your radio stations data

const SearchResults = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedRadioStation, setSelectedRadioStation] = useState(null); // Track the selected radio station
  const [accessToken, setAccessToken] = useState('');
  const [topCharts, setTopCharts] = useState([]);
  const [showMusic, setShowMusic] = useState('Music');

  useEffect(() => {
    // Get the access token when the component mounts
    async function fetchAccessToken() {
      const token = await getAccessToken();
      setAccessToken(token);
    }
    fetchAccessToken();

    // Fetch top charts when the component mounts
    async function fetchTopCharts() {
      try {
        const response = await axios.get('https://api.spotify.com/v1/search', {
          params: {
            q: 'ajr boywithuke gorillaz GRAHAM',
            type: 'track',
            limit: 48, // Limit to 48 results
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setTopCharts(response.data.tracks.items);
      } catch (error) {
        console.error(error);
      }
    }
    fetchTopCharts();
  }, [accessToken]);

  const handleSearch = async () => {
    if (!query) return;

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: query,
          type: 'track',
          limit: 48,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setResults(response.data.tracks.items);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    handleSearch();
    setShowMusic('Music')
  };

  const handleRadioStationClick = (index) => {
    setSelectedRadioStation(stationsData[index]); // Pass the selected radio station info
    setSelectedTrack(null); // Reset selected music track
  };

  return (
    <div>
      <center>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search any song..."
            value={query}
            onChange={handleInputChange}
          />
        </div>
        <div className="selectButtons">
        <button onClick={() => setShowMusic('Music')}>Music</button>&nbsp;
        <button onClick={() => setShowMusic('Radio')}>Radio</button>
        </div>
        {showMusic === 'Music' ? (
          <div className="search-results">
            {query &&
              results.map((track) => (
                <div
                  key={track.id}
                  className="search-result"
                  onClick={() =>
                    setSelectedTrack({
                      track: track.name,
                      artist: track.artists.map((artist) => artist.name).join(', '),
                      icon: track.album.images[0].url,
                      duration_ms: track.duration_ms, // Add track duration
                      explicit: track.explicit, // Add an explicit property
                    })
                  }
                >
  <div className="thumbnail">
    <img src={track.album.images[0].url} alt={track.name} />
  </div>
  <div className="info">
    <h3>
      {track.name}
      {track.explicit ? ' (Explicit)' : ' (Clean)'}
    </h3>
    <p>{track.artists.map((artist) => artist.name).join(', ')}</p>
  </div>
</div>
              ))}
            {query.length === 0 && (
              <div className="recommended-tracks">
                <div className="search-results">
                  {topCharts.map((track) => (
                    <div
                      key={track.id}
                      className="search-result"
                      onClick={() => {
                        setSelectedTrack({
                          track: track.name,
                          artist: track.artists.map((artist) => artist.name).join(', '),
                          icon: track.album.images[0].url,
                          duration_ms: track.duration_ms, // Add track duration
                          explicit: track.explicit, // Add an explicit property
                        });
                      }}
                    >
  <div className="thumbnail">
    <img src={track.album.images[0].url} alt={track.name} />
  </div>
  <div className="info">
    <h3>
      {track.name}
      {track.explicit ? ' (Explicit)' : ' (Clean)'}
    </h3>
    <p>{track.artists.map((artist) => artist.name).join(', ')}</p>
  </div>
</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : showMusic === 'Radio' ? (
          <div className="search-results">
            {stationsData.map((station, index) => (
              <div
                key={index}
                className="search-result" // Use the same class for consistency
                onClick={() => handleRadioStationClick(index)}
              >
                <div className="thumbnail">
                  <img src={station.icon} alt={station.name} />
                </div>
                <div className="info">
                  <h3>{station.name} {station.fmDial}FM</h3>
                  <p className="description">{station.description}</p>
                </div>
              </div>
            ))}
            <div
                className="search-result" // Use the same class for consistency
                onClick={() => window.open('https://ltunes.gq/newRadio', '_blank')}
              >
                <div className="thumbnail">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1-nZo1lghfuJpFf7lQHBcRILL5125AZAdWNkyWECASQ&s" alt="Submit new station" />
                </div>
                <div className="info">
                    <h3>Add Station</h3>
                    <p className="description">Submit new radio station to LTunes</p>
                </div>
              </div>
</div>
        ) : null}
        <div className="audio-player">
      {selectedTrack || selectedRadioStation ? (
          selectedTrack ? (
            <AudioPlayer
              trackInfo={selectedTrack}
              isRadio={false}
              explicit={selectedTrack.explicit} // Pass the explicit property
            />
          ) : (
            <AudioPlayer
              trackInfo={selectedRadioStation}
              isRadio={true}
            />
          )
        ) : null}
        </div>
      </center>
    </div>
  );
};

export default SearchResults;
