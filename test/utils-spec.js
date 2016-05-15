const Utils = require('../lib/utils');

const assert = require('assert');
const chai = require("chai");
chai.should();

describe("Utils", () => {
  describe('#indentLevel', () => {
    it("should return the indent level of the line.", () => {
      Utils.indentLevel("    int x = 10", 2).should.equal(2);
    })
  })
})
