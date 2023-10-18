'use strict';

const puppeteer = require('puppeteer');

const debug = (process.env.PRERENDER_DEBUG === 'true');

/**
 * @openapi
 *
 * /:
 *   post:
 *     description: Prerender website by URL
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns HTML response.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       500:
 *         description: Internal Server Error
 *         headers:
 *           Cache-Control:
 *             schema:
 *               type: string
 *               example: max-age=0
 */
exports.handler = async (event) => {
  try {
    const {url} = event.body && JSON.parse(event.body);

    let content;

    if (url) {

      // Parse the URL (HTML document)
      const browser = await puppeteer.launch({
        executablePath: process.env.LAMBDA_TASK_ROOT + '/headless_shell',
        args: [
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-setuid-sandbox',
          '--disable-software-rasterizer',
          '--data-path=/tmp',
          '--disk-cache-dir=/tmp',
          '--disk-cache-size=0',
          '--headless',
          '--ignore-certificate-errors',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
          '--user-data-dir=/tmp'
        ],
        dumpio: debug
      });

      const page = await browser.newPage();
      await page.goto(url, {waitUntil: 'networkidle0'});

      content = await page.content();
    }

    // Return success response.
    return {
      headers: {
        'Cache-Control': 'max-age=0',
        'Content-Type': 'text/html'
      },
      statusCode: 200,
      body: content
    };

  } catch (err) {

    debug && console.warn(err.message);

    // Return error response.
    return {
      headers: {'Cache-Control': 'max-age=0'},
      statusCode: 500
    };
  }
};
