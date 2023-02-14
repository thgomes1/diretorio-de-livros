import prettylink from 'prettylink';

export default async function getShortURL(URL) {
  const bitly = new prettylink.Bitly('a298dcbfe3e0604d73fa0dcc7e75870b7bc5d725');
  bitly.init('a298dcbfe3e0604d73fa0dcc7e75870b7bc5d725');

  const shortURL = await bitly
    .short(URL)
    .then((result) => {
      return result.link;
    })
    .catch((err) => {
      console.log(err, 'ERRO');
    });

  return shortURL;
}
