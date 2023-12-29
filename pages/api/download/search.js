// pages/api/download/search.js
import yts from 'yt-search';

export default async (artist, musicName) => {
  try {
    const searchQuery = `${artist} ${musicName} audio`;
    const searchResults = await yts(searchQuery);

    if (searchResults.videos.length === 0) {
      throw new Error('No results found');
    }

    return searchResults.videos[0].videoId;
  } catch (err) {
    throw new Error(`Search error: ${err.message}`);
  }
};