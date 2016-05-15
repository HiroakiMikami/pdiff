'use strict';

const Utils = require('./utils');

const blackLineR = /^(?:\s)*$/

class CodeAnalyzer {
  constructor(regExpOfTerminators) {
    this.regExpOfTerminators = regExpOfTerminators;
  }

  analyze(sourceCode) {
    const lines = sourceCode.split('\n');
    const tree = {
      nodes: []
    };
    var stack = [];
    var retval = [];

    var indentLevel = 0;
    var indentSize = null;

    for (let i = 0; i < lines.length; i++) {
      if ((i + 1) === lines.length && lines[i] === '') {
        continue;
      }
      const line_ = lines[i];
      const line = `${lines[i]}\n`

      // Initialize the indentSize
      if (indentSize === null) {
        const l = Utils.indentLevel(line_, 1);
        if (l !== 0) indentSize = l;
      }

      const level = Utils.indentLevel(line_, (indentSize === null) ? 1 : indentSize);
      if ((indentLevel + 1) === level) {
        // When enter the nested block
        const tree = {
          nodes: [line]
        };

        while (stack.length > level) {
          stack.pop();
        }
        if (stack.length === 0) {
          const p = {nodes: []}
          retval.push(p)
          stack.push(p);
        }
        stack[stack.length - 1].nodes.push(tree);
        stack.push(tree);

        indentLevel = level;
      } else if ((indentLevel - 1) === level) {
        // When leave the nested block

        while (stack.length > (level + 1)) {
          stack.pop();
        }

        if (this.regExpOfTerminators.test(line)) {
          // When the line works as a terminator
          stack[stack.length - 1].nodes.push(line);
        } else {
          stack[stack.length - 1] = {
            nodes: [line]
          };
        }

        indentLevel = level;
      } else {
        if (stack.length < (indentLevel + 1)) {
          const tree = {nodes: []}

          if (indentLevel === 0) {
            retval.push(tree);
          } else {
            stack[indentLevel - 1].nodes.push(tree);
          }
          stack[indentLevel] = tree;
        }

        stack[indentLevel].nodes.push(line);
        if (blackLineR.test(line)) {
          // When the line is blank
          while (stack.length > indentLevel) {
            stack.pop();
          }
        }
      }
    }

    return retval;
  }
}

module.exports = CodeAnalyzer;
