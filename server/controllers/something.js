import createSomething from '../pages/createSomething';

const maxAge = 1800; // 30 mins
const sMaxAge = 600; // 10 min
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);
  res.render('welcome.html', await createSomething());
};
