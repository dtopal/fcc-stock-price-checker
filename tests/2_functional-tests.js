/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    suite('GET /api/stock-prices => stockData object', function() {

      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog' })
        .end(function(err, res){
           assert.equal(res.status, 200);
           assert.property(res.body, 'stockData', 'Response should contain stockData object');
           assert.equal(res.body.stockData.stock, 'GOOG');
           assert.isString(res.body.stockData.price, 'price should return as a string');//should this be a number, should return from API as a string
           assert.isNumber(Number(res.body.stockData.price), 'price should be convertable to a number');
           assert.isNumber(res.body.stockData.likes, 'likes should be a number');
           done();
        });
      });

      test('1 stock with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'goog', like: true})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData', 'Response should contain stockData object');
            assert.equal(res.body.stockData.stock, 'GOOG');
            assert.isString(res.body.stockData.price, 'price should return as a string');//should this be a number, should return from API as a string
            assert.isNumber(Number(res.body.stockData.price), 'price should be convertable to a number');
            assert.isNumber(res.body.stockData.likes, 'likes should be a number');
            done();
          });

      });

      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'intc', like: true })
          .end(function(err, resA){
            var numLikes = resA.body.stockData.likes;

            chai.request(server)
              .get('/api/stock-prices')
              .query({ stock: 'intc', like: true })
              .end(function(err, resB){
                assert.equal(resB.status, 200);
                assert.equal(resB.body.stockData.stock, 'INTC');
                assert.equal(resB.body.stockData.likes, numLikes + 1);
                done();
              });
          });

      });

      test('2 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['goog', 'intc'] })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body.stockData, 'stockData should be an array');
            assert.equal(res.body.stockData.length, 2);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.isString(res.body.stockData[0].price, 'price should return as a string');
            assert.isNumber(res.body.stockData[0].rel_likes, 'rel_likes should be a number');
            assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0);
            done();
          });

      });

      test('2 stocks with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['goog', 'intc'], like: true })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body.stockData, 'stockData should be an array');
            assert.equal(res.body.stockData.length, 2);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.isString(res.body.stockData[0].price, 'price should return as a string');
            assert.isNumber(res.body.stockData[0].rel_likes, 'rel_likes should be a number');
            assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0);
            done();
          });
      });

    });

});
