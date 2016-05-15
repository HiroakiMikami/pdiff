const adiff = require('../lib/array-diff');

const assert = require('assert');
const chai = require("chai");
chai.should();

describe("ArrayDiff", () => {
  describe('#function', () => {
    it("should calculate the difference between two arrays.", () => {
      adiff([1, 5, 2, 3], [-1, 2]).should.deep.equal(
        [
          {
            added: undefined,
            removed: true,
            value: [1, 5]
          },
          {
            added: true,
            removed: undefined,
            value: [-1]
          },
          {
            value: [2]
          },
          {
            added: undefined,
            removed: true,
            value: [3]
          }
        ]
      );
    });
    it("should be able to use a custom equals function.", () => {
      adiff([{}, {"foo": "bar"}], [{}, {"foo": "bar"}], (e1, e2) => {
        return JSON.stringify(e1) === JSON.stringify(e2);
      }).should.deep.equal(
        [
          {
            value: [{}, {"foo": "bar"}]
          }
        ]
      );
    });
  });
});
