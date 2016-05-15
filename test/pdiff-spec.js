var pdiff = require('../lib/main');

var assert = require('assert');
var chai = require("chai");
chai.should();

describe("pdiff", () => {
  describe("#addLineNumbers", () => {
    it("should return a diff data with line numbers when words are replaced.", () => {
      var diff = pdiff.addLineNumbers(pdiff.diff(
        "test: 10\n",
        "test: 20\n"
      ));
      diff.should.deep.equal([
        {
          lineNumberOfLhs: 0,
          lineNumberOfRhs: 0,
          values: [{
            value: "test: "
          },
          {
            removed: true,
            value: "10"
          },
          {
            added: true,
            value: "20"
          }]
        }
      ])
    })
    it("should return a diff data with line numbers when lines are inserted.", () => {
      var diff = pdiff.addLineNumbers(pdiff.diff(
        "test: 10\n",
        "test: 10\ntest: 20\n"
      ));
      diff.should.deep.equal([
        {
          lineNumberOfLhs: 0,
          lineNumberOfRhs: 0,
          values: [{
            value: "test: 10"
          }]
        },
        {
          lineNumberOfRhs: 1,
          values: [
            {
              added: true,
              value: "test: 20"
            }
          ]
        }
      ])
    })
    it("should return a diff data with line numbers when lines are removed.", () => {
      var diff = pdiff.addLineNumbers(pdiff.diff(
        "test: 10\ntest: 20\n",
        "test: 10\n"
      ));
      diff.should.deep.equal([
        {
          lineNumberOfLhs: 0,
          lineNumberOfRhs: 0,
          values: [{
            value: "test: 10"
          }]
        },
        {
          lineNumberOfLhs: 1,
          values: [{
            removed: true,
            value: "test: 20"
          }]
        }
      ])
    })
    it("should return a diff data with line numbers when lines are replaced.", () => {
      var diff = pdiff.addLineNumbers(pdiff.diff(
        "foo\n",
        "bar\ntest: 10\n"
      ));
      diff.should.deep.equal([
        {
          lineNumberOfLhs: 0,
          values: [
            {
              removed: true,
              value: "foo"
            }
          ]
        },
        {
          lineNumberOfRhs: 0,
          values: [{
              added: true,
              value: "bar"
            }
          ]
        },
        {
          lineNumberOfRhs: 1,
          values: [
            {
              added: true,
              value: "test: 10"
            }
          ]
        }
      ])
    })
    it("should deal with the buggy case(https://github.com/HiroakiMikami/pdiff/issues/12)", () => {
      pdiff.addLineNumbers(pdiff.diff(
        "{\nprivate: true\n}\n",
        "{\n}\n"
      )).should.deep.equal([
        {
          lineNumberOfLhs: 0,
          lineNumberOfRhs: 0,
          values: [{value: "{"}]
        },
        {
          lineNumberOfLhs: 1,
          values: [{
            removed: true,
            value: "private: true"
          }]
        },
        {
          lineNumberOfLhs: 2,
          lineNumberOfRhs: 1,
          values: [{value: "}"}]
        }
      ])
    })
    it("should extract an insertion and deletion.", () => {
      var result = pdiff.addLineNumbers(pdiff.diff(
        "{\n  foo: 0\n}\n", "{\n  foo: 0,\n  bar: 1\n}\n"
      ))
      result.should.deep.equal([
        {
          lineNumberOfLhs: 0,
          lineNumberOfRhs: 0,
          values: [{value: "{"}]
        },
        {
          lineNumberOfLhs: 1,
          lineNumberOfRhs: 1,
          values: [
            {
              value: "  foo: 0"
            },
            {
              added: true,
              value: ","
            }
          ]
        },
        {
          lineNumberOfRhs: 2,
          values: [{
            added: true,
            value: "  bar: 1"
          }]
        },
        {
          lineNumberOfLhs: 2,
          lineNumberOfRhs: 3,
          values: [{value: "}"}]
        }
      ])
    })
  })
  describe("#extractDiff", () => {
    it("should return a grouped diff.", () => {
      var diff = pdiff.addLineNumbers(pdiff.diff(
        "foo\nbar\n",
        "test\nbar\ntest: 10\n"
      ));
      var extractedDiff = pdiff.extractDiff(diff, 0);
      extractedDiff.should.deep.equal([
        [
          {
            lineNumberOfLhs: 0,
            lineNumberOfRhs: 0,
            values: [
              {
                removed: true,
                value: "foo"
              },
              {
                added: true,
                value: "test"
              }
            ]
          }
        ],
        [
          {
            lineNumberOfRhs: 2,
            values: [{
              added: true,
              value: "test: 10"
            }]
          }
        ]
      ]);
    })
  })
})
