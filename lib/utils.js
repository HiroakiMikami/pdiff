'use strict';

const indentR = /^(\s+)/;

class Utils {
  static indentLevel(line, indentSize) {
    const result = indentR.exec(line);
    if (result == null || result.length == 0) return 0;
    else return result[0].length / indentSize;
  }
}

module.exports = Utils;
