var tdiff = require('../lib/textual-diff');

var assert = require('assert');
var chai = require("chai");
chai.should();

describe("TextualDiff", () => {
  describe('#function', () => {
    it("should diff on word boundaries.", () => {
      var result = tdiff("var x = 10;", "var x = 20;");

      result.should.deep.equal([
        {
          value: "var x = "
        },
        {
          added: undefined,
          removed: true,
          value: "10"
        },
        {
          added: true,
          removed: undefined,
          value: "20"
        },
        {
          value: ";"
        }
      ])
    })
    it("should diff lines when a delta is large.", () => {
      var result = tdiff(
        [
          "function fib(n)",
          "  if (n <= 1) return 1;",
          "  else return fib(n-1) + fib(n-2);",
          "}",
          "",
          "function initialize() {",
          "  alert('foo');",
          "}"
        ].join("\n"),
        [
          "function initialize() {",
          "  alert('foo');",
          "}"
        ].join("\n")
      );

      result.should.deep.equal([
        {
          added: undefined,
          removed: true,
          value: [
            "function fib(n)",
            "  if (n <= 1) return 1;",
            "  else return fib(n-1) + fib(n-2);",
            "}",
            "",
            ""
          ].join("\n")
        },
        {
          value: [
            "function initialize() {",
            "  alert('foo');",
            "}"
          ].join("\n")
        }
      ])
    })
    it("should extract an insertion and deletion.", () => {
      var result = tdiff(
        "{\n  foo: 0\n}\n", "{\n  foo: 0,\n  bar: 1\n}\n"
      )
      result.should.deep.equal([
        {value: "{\n"},
        {value: "  foo: 0"},
        {
          removed: undefined,
          added: true,
          value: ","
        },
        {value: "\n"},
        {
          removed: undefined,
          added: true,
          value: "  bar: 1\n"
        },
        {value: "}\n"}
      ])
    })
  })
})
