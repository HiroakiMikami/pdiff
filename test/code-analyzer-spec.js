const CodeAnalyzer = require('../lib/code-analyzer');

const assert = require('assert');
const chai = require("chai");
chai.should();

const Analyzer = new CodeAnalyzer(/^\W*$/);

describe("CodeAnalyzer", () => {
  describe('#analyze', () => {
    it("should analyze the source code by using the indent.", () => {

      const result = Analyzer.analyze(`
func x() {
  int x = 10;
}
`);
      result.should.deep.equal([
        {
          nodes: ["\n"],
        },
        {
          nodes: [
            "func x() {\n",
            {
              nodes: ["  int x = 10;\n"]
            },
            "}\n",
            "\n"
          ]
        }
      ]);
    })
    it("should analyze the source code by using blank lines", () => {
      const result = Analyzer.analyze(`
int x = 10;
int y = 20;

double r = 2.0;
`);
      result.should.deep.equal([
        {
          nodes: ["\n"],
        },
        {
          nodes: [
            "int x = 10;\n",
            "int y = 20;\n",
            "\n"
          ]
        },
        {
          nodes: [
            "double r = 2.0;\n",
            "\n"
          ]
        }
      ]);
    })
    it("should deal with unusual indents (1).", () => {
      const result = Analyzer.analyze(`

 * foo
`);
      result.should.deep.equal([
        {
          nodes:["\n"]
        },
        {
          nodes:["\n"]
        },
        {
          nodes: [{
            nodes: [
              " * foo\n"
            ]
          }]
        }
      ])
    })
  })
})
