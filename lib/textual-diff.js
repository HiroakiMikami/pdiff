'use strict';

const diff = require('diff');

module.exports = (lhs, rhs) =>{
  var result = []

  const getString = (str) => {
    return (str == null || str == undefined) ? "" : str;
  }
  const addDelta = (delta) => {
    delete delta["count"];
    result.push(delta);
  }

  const lhs_ = getString(lhs);
  const rhs_ = getString(rhs);
  const lineDiff = diff.diffLines(lhs_, rhs_);
  var index = 0;
  while (index < lineDiff.length) {
    const delta1 = lineDiff[index];
    if (index < lineDiff.length - 1) {
      const delta2 = lineDiff[index + 1];

        if (delta1.removed && delta2.added) {
        var useLineDiffFlag = false;

        // Decide whether word diff is used
        if (delta1.count == delta2.count) {
          const wordDiff = diff.diffWords(delta1.value, delta2.value, {
            ignoreWhitespace: false
          });

          // Might use word diff when number of lines of original and revised texts are same.
          for (let delta of wordDiff) {
            if ((delta.added || delta.removed) && ~delta.value.indexOf('\n')) {
              useLineDiffFlag = true;
              break;
            }
          }
          if (!useLineDiffFlag) {
            // Use word diff
            for (let delta of wordDiff) {
              addDelta(delta);
            }
          }
        } else {
          const lines1 = delta1.value.split("\n");
          const lines2 = delta2.value.split("\n");

          const maxLineNum = Math.max(lines1.length - 1, lines2.length - 1);
          var diffMap = [];

          var added = true;
          var removed = true;

          for (let i = 0; i < maxLineNum; i++) {
            if (i < lines1.length - 1) {
              const line1 = lines1[i];
              if (i < lines2.length - 1) {
                const line2 = lines2[i];
                const wordDiff = diff.diffWords(line1, line2)
                wordDiff.push({value: "\n"})
                diffMap.push(wordDiff);

                for (let delta of wordDiff) {
                  if (delta.added) removed = false;
                  if (delta.removed) added = false;
                }
              } else {
                diffMap.push([{
                  added: undefined,
                  removed: true,
                  value: line1 + "\n"
                }])

                added = false
              }
            } else {
              const line2 = lines2[i];
              diffMap.push([{
                added: true,
                removed: undefined,
                value: line2 + "\n"
              }])

              removed = false
            }

            if (!added && !removed) break;
          }
          if (added || removed) {
            for (let diff of diffMap) {
              for (let delta of diff) {
                addDelta(delta)
              }
            }
          } else {
            useLineDiffFlag = true;
          }
        }

        if (useLineDiffFlag) {
          // Use line diff
          addDelta(delta1);
          addDelta(delta2);
        }

        index += 2;
      } else {
        addDelta(delta1);

        index += 1;
      }
    } else {
      addDelta(delta1);

      index += 1;
    }
  }

  return result;
}
