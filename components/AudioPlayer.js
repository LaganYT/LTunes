//components/AudioPlayer.js
import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faDownload, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'; // Import the axios library

const AudioPlayer = ({ trackInfo, isRadio, onTrackEnd }) => {
  const audioRef = useRef(null);
  const [audioStreamURL, setAudioStreamURL] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [savedTime, setSavedTime] = useState(0);
  const [lyrics, setLyrics] = useState('');
  const [trackSelected, setTrackSelected] = useState(false); // Track selection state
  const [showLyrics, setShowLyrics] = useState(false); // Lyrics visibility state

  const { artist, track, icon, description, name, fmDial, explicit } = trackInfo;

  useEffect(() => {
    if (isRadio) {
      // Radio selected, update audio stream URL from radio station data
      setAudioStreamURL(trackInfo.url);
      setTrackSelected(true); // Radio station has been selected
      setLyrics("No Lyrics for radio");
      setShowLyrics(false); // Reset lyrics visibility when a new track is loaded
    } else if (!isRadio && trackInfo) {
      // Music selected, fetch audio stream URL from API
      setTrackSelected(false); // Reset track selection when a new track is loaded
      setLyrics("Loading...");
      setCurrentTime(0); // Reset currentTime to 0 when a new track is loaded
      setSavedTime(0);

      fetch(`/api/stream?artist=${artist}&musicName=${track} ${explicit ? '(Explicit)' : '(Clean)'}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.audioURL) {
            setAudioStreamURL(data.audioURL);
            setTrackSelected(true); // Music track has been selected
            setCurrentTime(0);
            fetchLyrics();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [trackInfo, artist, track, isRadio]);

  useEffect(() => {
    if (audioStreamURL) {
      if (audioRef.current) {
        audioRef.current.src = audioStreamURL;
        if (isPlaying) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }
    }
  }, [audioStreamURL, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onloadedmetadata = () => {
        setDuration(audioRef.current.duration);
      };
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setSavedTime(audioRef.current.currentTime);
    }
  }, [isPlaying]);

  const searchForTrackId = async (artist, track) => {
    try {
      // Use the Shazam API to search for the track ID based on artist and track name
      const searchResponse = await axios.get('https://shazam.p.rapidapi.com/search', {
        headers: {
          'X-RapidAPI-Host': 'shazam.p.rapidapi.com',
          'X-RapidAPI-Key': '96e7095bdcmsh50743819712fc6dp120c19jsnf6dfc8ed91f3', // Replace with your actual RapidAPI key
        },
        params: {
          term: `${artist} ${track}`, // Search by artist and track name
          locale: 'en-US',
          offset: '0',
          limit: '1',
        },
      });

      // Extract the track ID from the search response
      const trackId = searchResponse.data.tracks.hits[0].track.key; // Assuming the first track in hits is the desired one

      return trackId;
    } catch (error) {
      console.error('Error searching for track ID:', error);
      return null; // Return null if there's an error
    }
  };

  const fetchLyrics = async () => {
    if (trackSelected) {
      try {
        // Search for the track ID
        const trackId = await searchForTrackId(artist, track);

        if (!trackId) {
          console.error('Track ID not found.');
          return;
        }

        // Use the track ID to fetch song details
        const detailsResponse = await axios.get('https://shazam.p.rapidapi.com/songs/get-details', {
          headers: {
            'X-RapidAPI-Host': 'shazam.p.rapidapi.com',
            'X-RapidAPI-Key': '96e7095bdcmsh50743819712fc6dp120c19jsnf6dfc8ed91f3', // Replace with your actual RapidAPI key
          },
          params: {
            key: trackId,
            locale: 'en-US',
          },
        });

        // Extract the lyrics from the "LYRICS" section
        const lyrics = detailsResponse.data.sections.find((section) => section.type === 'LYRICS');

        // Check if lyrics are found and set them in the state
        if (lyrics && lyrics.text) {
          setLyrics(lyrics.text.join('\n'));
        } else {
          setLyrics('No Lyrics Found.');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleLyricsButtonClick = () => {
    if (trackSelected) {
      fetchLyrics();
      setShowLyrics(!showLyrics);
    }
  };

  function openUrlInNewTab(videoId) {
    //const url = `https://ytdl.shyechern.com/api/download?url=https://youtube.com/watch?v=${videoId}`;
    const url = `https://stirring-woolly-reminder.glitch.me/download?url=https://youtube.com/watch?v=${videoId}`
    window.open(url, '_blank');
  }
  
  const handleDownload = async () => {
    try {
  
      // Make a fetch request to the API endpoint
      const response = await fetch(`/api/search?artist=${artist}&musicName=${track}`);
  
      // Check if the request was successful (status code 200)
      if (response.ok) {
        const data = await response.json();
  
        // Get the videoId from the response
        const videoId = data.videoId;
  
        // Check if videoId is available
        if (!videoId) {
          console.error('No video found for the given query');
          return;
        }
  
        // Construct the URL for download
        const downloadUrl = `https://stirring-woolly-reminder.glitch.me/download?url=https://youtube.com/watch?v=${videoId}`
        //const downloadUrl = `https://ytdl.shyechern.com/api/download?url=https://youtube.com/watch?v=${videoId}`;
  
        // Create a temporary link element
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.target = '_blank';
        downloadLink.style.display = 'none';
  
        // Append the link to the document body and trigger the click event
        document.body.appendChild(downloadLink);
        downloadLink.click();
  
        // Remove the link from the document body
        document.body.removeChild(downloadLink);
  
        // Optionally, open the YouTube URL in a new tab
        openUrlInNewTab(videoId);
      } else {
        // Handle errors
        const errorData = await response.json();
        console.error('Error:', errorData.message);
      }
    } catch (error) {
      console.error('Error during download:', error.message);
    }
  };

  const handlePlayPause = () => {
    if (!isPlaying) {
      audioRef.current.currentTime = savedTime;
      audioRef.current.play();
    } else {
      audioRef.current.pause();
      setSavedTime(audioRef.current.currentTime);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (!isPlaying) {
          audioRef.current.currentTime = savedTime;
        }
      });
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (isPlaying) {
      setCurrentTime(audioRef.current.currentTime);
      setSavedTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const newTime = e.target.value;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <center>
            {trackSelected && showLyrics && lyrics && (
            <div className="lyrics">
            <h2>{lyrics}</h2>
            </div>
        )}
      <div className="audio-player">
        <img className="thumbnail" src={icon} alt="Thumbnail" />
        <div className="info">
          <div className="song-info">
            {track &&<h3>{track}  {explicit ? ' (Explicit)' : ' (Clean)'}</h3>}
            <p>{artist}</p>
            {name && <h3>{name} {fmDial}FM</h3>}
            {description && <p className="description">{description}</p>}
          </div>

          <div className="audio-controls">
            <audio
              ref={audioRef}
              hidden
              onTimeUpdate={handleTimeUpdate}
              onEnded={onTrackEnd}
              autoPlay
            />
            <button className="control-button" onClick={handlePlayPause}>
              {isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
            </button>
            <input
              type="range"
              min={0}
              max={duration}
              step={1}
              value={currentTime}
              onChange={handleSeek}
            />
            {!isRadio && trackSelected && (
              <div id="lyricButton" className="lyric-button">
                <button id="lyricButton" className="control-button" onClick={handleLyricsButtonClick}>
                  <FontAwesomeIcon icon={faAlignLeft} />
                </button>
              </div>
            )}
            {!isRadio && trackSelected && (
              <button id="download" className="control-button" onClick={handleDownload}>
                <FontAwesomeIcon icon={faDownload} />
              </button>
            )}
            <div className="time-display">
              {formatTime(currentTime)}
              {!isRadio && ` / ${formatTime(duration)}`}
            </div>
          </div>
        </div>
        <style jsx>{`
          .audio-player {
            display: flex;
            flex-direction: row;
            align-items: center;
            background-color: #161616c4;
            padding: 20px;
            box-shadow: 0px -2px 6px rgba(0, 0, 0, 0.5);
            max-width: fit-content;
            width: auto;
            position: sticky;
            bottom: 0;
            z-index: 100;
          }

          .thumbnail {
            max-width: 100px;
            max-height: 100px;
            border-radius: 4px;
            margin-right: 16px;
          }

          .info {
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          .song-info {
            font-size: 18px;
            margin-bottom: 10px;
          }

          .audio-controls {
            display: flex;
            align-items: center;
          }

          .control-button {
            background-color: #007bff;
            color: #fff;
            display: inline;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 8px;
          }

          .control-button:hover {
            background-color: #0056b3;
          }

          .time-display {
            margin-top: 10px;
          }
        `}
        </style>
      </div>
    </center>
  );
};
export default AudioPlayer;

