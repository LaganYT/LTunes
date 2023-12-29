// pages/api/getMp3.js
import ytdl from 'node-ytdl-core-v2';
import ytSearch from 'yt-search';

export default async (req, res) => {
  if (req.method === 'GET') {
    const { artist, musicName } = req.query;

    try {
      // Perform a YouTube search for the artist and music name
      const query = `${artist}-topic ${musicName}`;
      const searchResults = await ytSearch(query);
      
      if (searchResults.videos.length === 0) {
        return res.status(404).json({ message: 'No videos found for the given query' });
      }

      // Get the video ID of the top search result
      const videoId = searchResults.videos[0].videoId;

      // Fetch audio stream URL using node-ytdl-core-v2
      ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`)
        .then(info => {
          const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
          if (audioFormat) {
            res.status(200).json({ audioURL: audioFormat.url });
          } else {
            res.status(404).json({ message: 'Audio format not found' });
          }
        })
        .catch(error => {
          console.error(error);
          res.status(500).json({ message: 'Error fetching audio' });
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
