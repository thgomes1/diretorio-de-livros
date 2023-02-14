import cheerio from 'cheerio';
import axios from 'axios';
import getShortURL from './getShortURL';

export const getBookInfo = async (URL) => {
  const bookInfo = {};

  bookInfo.url = await getShortURL(URL);

  await axios(URL).then((res) => {
    const body = res.data;

    var $ = cheerio.load(body);

    bookInfo.title = $('#productTitle').text().trim();

    bookInfo.cover = $('#imgBlkFront').attr('src');

    bookInfo.price = $('span.a-color-base .a-size-base.a-color-price').text().trim();

    bookInfo.category = $('a.a-link-normal.a-color-tertiary').first().text().trim();
  });

  return bookInfo;
};

export const getBookPrices = async (URLs) => {
  let newBookPrices = [];

  for (let URL of URLs) {
    await axios(URL).then((res) => {
      const body = res.data;

      var $ = cheerio.load(body);

      newBookPrices.push($('span.a-color-base .a-size-base.a-color-price').text().trim());
    });
  }

  console.log(newBookPrices);
  return newBookPrices;
};
