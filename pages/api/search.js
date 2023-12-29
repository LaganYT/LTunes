// pages/api/search.js
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

      // Return the video ID in the response
      res.status(200).json({ videoId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
