const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const argv = require('yargs').argv;
const { cleanEnv, str, num } = require('envalid');

dotenv.config();

const env = cleanEnv(process.env, {
  PROXY_SERVER: str({ default: '0.0.0.0' }),
  PROXY_PORT: num({ default: 3128 }),
  PROXY_USERNAME: str({ default: '' }),
  PROXY_PASSWORD: str({ default: '' }),
});

;(async () => {
  const proxyURL = getProxyURL(env.PROXY_SERVER, env.PROXY_PORT, env.PROXY_USERNAME, env.PROXY_PASSWORD);

  const launchOptions = {
    headless: argv.show ? false : 'new',
    args: [`--proxy-server=${proxyURL}`]
  };

  try {
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    const testURL = 'https://myip.com';
    await page.goto(testURL);
    await page.waitForNetworkIdle();

    const ip = await page.$eval('#ip', el => el.innerText);

    console.log('IP Address:', ip);

    await browser.close();
  } catch (error) {
    console.error('Error occurred:', error);
  }
})();

function getProxyURL(server, port, username, password) {
  let url = `${server}:${port}`;

  if (username && password) {
    url = `${username}:${password}@${url}`;
  };

  return url;
}
