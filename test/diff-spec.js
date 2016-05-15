var diff = require('../lib/diff');

var assert = require('assert');
var chai = require("chai");
chai.should();

describe("Diff", () => {
  describe('#function', () => {
    it("should return no difference if two texts are same.", () => {
      const result = diff(
`function f(arg1, arg2) {
  console.log("foo");
  console.log("bar");
}
`,
`function f(arg1, arg2) {
  console.log("foo");
  console.log("bar");
}
`
      );

      result.should.deep.equal([
        {
          value: 'function f(arg1, arg2) {\n  console.log("foo");\n  console.log("bar");\n}\n'
        }
      ])
    })
    it("should recognize changes in a function.", () => {
      const result = diff(
`function f(arg1, arg2) {
  console.log("foo");
  console.log("bar");
}
`,
`function g(test, test2) {
  console.log("foo");
  console.log("bar");
}
`
      );

      result.should.deep.equal([
        {
          added: undefined,
          removed: true,
          value: 'function f(arg1, arg2) {\n  console.log("foo");\n  console.log("bar");\n}\n'
        },
        {
          added: true,
          removed: undefined,
          value: 'function g(test, test2) {\n  console.log("foo");\n  console.log("bar");\n}\n'
        }
      ])
    })
    it("should recognize changes in a function body.", () => {
      const result = diff(
`function f(arg1, arg2) {
  console.log("foo");
  console.log("bar");
}
`,
`function f(arg1, arg2) {
  alert(arg1);
  alert(arg2);
}
`
      );

      result.should.deep.equal([
        {
          value: 'function f(arg1, arg2) {\n'
        },
        {
          added: undefined,
          removed: true,
          value: '  console.log("foo");\n  console.log("bar");\n'
        },
        {
          added: true,
          removed: undefined,
          value: '  alert(arg1);\n  alert(arg2);\n'
        },
        {
          value: '}\n'
        }
      ])
    })
    it("should recognize changes in a statement (2).", () => {
      const result = diff(
`function f(arg1, arg2) {
  console.log("foo");
  console.log("bar");
}
`,
`function f(arg1, arg2) {
  alert(arg1);
  console.log("bar");
}
`
      );

      result.should.deep.equal([
        {
          value: 'function f(arg1, arg2) {\n'
        },
        {
          added: undefined,
          removed: true,
          value: '  console.log("foo");\n'
        },
        {
          added: true,
          removed: undefined,
          value: '  alert(arg1);\n'
        },
        {
          value: '  console.log("bar");\n}\n'
        }
      ])
    })
    it("should recognize changes in a statement (2).", () => {
      const result = diff(
`function f(arg1, arg2) {
  console.log("foo");
  console.log("bar");
}
`,
`function f(arg1, arg2) {
  console.log(arg1);
  console.log("bar");
}
`
      );

      result.should.deep.equal([
        {
          value: 'function f(arg1, arg2) {\n  console.log'
        },
        {
          added: undefined,
          removed: true,
          value: '("foo");'
        },
        {
          added: true,
          removed: undefined,
          value: '(arg1);'
        },
        {
          value: '\n  console.log("bar");\n}\n'
        }
      ])
    })
  })
})
