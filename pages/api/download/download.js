// pages/api/download/download.js
import search from './search';
import download from './down';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async (req, res) => {
  if (req.method === 'GET') {
    const { artist, musicName } = req.query;
    try {
      if (artist && musicName) {
        const id = search(artist, musicName);
        const url = `https://youtube.com/watch?v=_5UYkgC_oGE`; //${id}

        await download(url, res);
      } else {
        res.status(404).send();
      }
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
};