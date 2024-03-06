'use strict';

const puppeteer = require('puppeteer');

const debug = (process.env.PRERENDER_DEBUG === 'true');

// Shared between invocations.
let browser;

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
 *               image:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Returns HTML/Base64 response.
 *         headers:
 *           Cache-Control:
 *             schema:
 *               type: string
 *               example: max-age=0
 *           Content-Type:
 *             schema:
 *               type: string
 *               enum:
 *                 - text/html
 *                 - text/plain
 *           X-Runtime:
 *             schema:
 *               type: number
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *           text/plain:
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
    const {url, image} = event.body && JSON.parse(event.body);

    let content, mimeType, endTime;

    if (url) {

      // Initialize once, to close on function timeout.
      if (!browser) {
        browser = await puppeteer.launch({
          executablePath: process.env.LAMBDA_TASK_ROOT + '/headless_shell',
          args: [
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-gpu-compositing',
            '--disable-setuid-sandbox',
            '--disable-software-rasterizer',
            '--data-path=/tmp',
            '--disk-cache-dir=/tmp',
            '--disk-cache-size=0',
            '--headless="new"',
            '--ignore-certificate-errors',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--single-process',
            '--user-data-dir=/tmp'
          ],
          dumpio: debug
        });

        debug && console.info('headless_shell initialized');
      }

      // Parse the URL content (HTML document)
      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: (process.env.PRERENDER_TIMEOUT || 60) * 1000
      });

      const startTime = Date.now();

      if (image === true) {
        content  = await page.screenshot({encoding: 'base64'});
        mimeType = 'text/plain';

      } else {
        content  = await page.content();
        mimeType = 'text/html';
      }

      endTime = Date.now() - startTime;

      debug && console.info(`Runtime: ${endTime} ms`);

      await page.close();

      // Prevent hanging process (Mocha suite).
      if (process.env.NODE_ENV === 'test') {
        await browser.close();

        browser = null;
      }
    }

    // Return success response.
    return {
      headers: {
        'Cache-Control': 'max-age=0',
        'Content-Type': mimeType,
        'X-Runtime': endTime
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
