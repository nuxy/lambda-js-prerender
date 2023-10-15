'use strict';

const app  = require(`${PACKAGE_ROOT}/src/app`).handler;
const chai = require('chai');

chai.use(require('chai-match'));

const LambdaTester = require('lambda-tester');

const expect = chai.expect;

describe('Event handler', function() {
  this.timeout(5000);

  describe('render HTML', function() {
    const eventData = {};

    before(function() {
      eventData.body = JSON.stringify({url: 'https://aurelia.io'});
    });

    it('success', async function() {
      await LambdaTester(app)
        .event(eventData)
        .expectResult(result => {

          // Asertions.
          expect(result.headers).to.have.property('Cache-Control');
          expect(result.headers['Cache-Control']).to.equal('max-age=0');

          expect(result.headers).to.have.property('Content-Type');
          expect(result.headers['Content-Type']).to.equal('text/html');

          expect(result.statusCode).to.be.an('number');
          expect(result.statusCode).to.equal(200);

          expect(result.body).to.be.an('string');
          expect(result.body).to.match(/aurelia-app/);
        });
    });
  });
});
