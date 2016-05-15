'use strict';

const CodeAnalyzer = require('./code-analyzer');
const arrayDiff = require('./array-diff');
const textualDiff = require('./textual-diff');

const defaultAnalyzer = new CodeAnalyzer(/\W+/);
const defaultSimilarityThreshold = 0.8;

module.exports = (lhs, rhs, options) => {
  options = options || {};
  const similarityThreshold = options.similarityThreshold || defaultSimilarityThreshold;
  const analyzer = options.analyzer || defaultAnalyzer;

  // Obtain the trees of lhs and rhs.
  const lTree = analyzer.analyze(lhs);
  const rTree = analyzer.analyze(rhs);

  // Stringify a node
  const stringify = (n) => {
    if ((typeof n) === 'string') {
      return n;
    }
    const nodes = n.nodes || [];
    return nodes.map((v) => { return stringify(v); }).join('');
  }
  const equalsBetweenNodes = (n1, n2) => {
    return stringify(n1) === stringify(n2);
  }
  const similarity = (n1, n2) => {
    const s1 = n1.map(v => {
      if ((typeof v) === 'string') {
        return v;
      }
      return v.nodes.filter((c) => { return (typeof c) === 'string'; }).join('')
    }).join('');
    const s2 = n2.map(v => {
      if ((typeof v) === 'string') {
        return v;
      }
      return v.nodes.filter((c) => { return (typeof c) === 'string'; }).join('')
    }).join('');

    // Calculate LCS (the longest common subsequence) of s1 and s2
    // TODO: should calculate LCS by using words instead of characters
    //// Initialize a table
    const table = new Array(s1.length + 1);
    for (let i = 0; i < table.length; i++) { table[i] = new Array(s2.length + 1); }
    for (let i = 0; i < s1.length; i++) {
      for (let j = 0; j < s2.length; j++) {
        table[i][j] = table[i][j] || 0;
        table[i][j+1] = table[i][j+1] || 0;
        table[i+1][j] = table[i+1][j] || 0;

        const match = (s1.charAt(i) == s2.charAt(j)) ? 1 : 0;
        table[i+1][j+1] = Math.max(
          table[i][j] + match,
          table[i][j+1],
          table[i+1][j]
        )
      }
    }
    const lcs = table[s1.length][s2.length];

    return lcs * 1.0 / Math.min(s1.length, s2.length);
  }

  var retval_ = [];
  const addDelta = (delta) => {
    const value = delta.value.map((v) => stringify(v)).join('');
    if (delta.removed) {
      retval_.push({
        added: undefined,
        removed: true,
        value: value
      });
    } else if (delta.added) {
      retval_.push({
        added: true,
        removed: undefined,
        value: value
      });
    } else {
      retval_.push({
        value: value
      });
    }
  }
  const calculateDiff = (tree1, tree2) => {
    // Calculate the difference between nodes
    const diff = arrayDiff(tree1.nodes, tree2.nodes, equalsBetweenNodes);
    // Add deltas to retval_
    var removedNode = null
    for (let delta of diff) {
      if (removedNode !== null) {
        if (delta.added && similarity(removedNode.value, delta.value) >= similarityThreshold) {
          // If replace from removedNode to delta and they are similar
          const n1_ = removedNode.value.map((v) => { return v.nodes || [v] })
          const n2_ = delta.value.map((v) => { return v.nodes || [v] });
          // Flatten n1_ and n2_
          const n1 = Array.prototype.concat.apply([], n1_);
          const n2 = Array.prototype.concat.apply([], n2_);

          if (
            n1.every((v) => { return (typeof v) === 'string' }) &&
            n2.every((v) => { return (typeof v) === 'string' })
          ) {
            const tdiff = textualDiff(n1.join(''), n2.join(''));
            for (let d of tdiff) {
              if (d.removed) {
                retval_.push({
                  added: undefined,
                  removed: true,
                  value: d.value
                });
              } else if (d.added) {
                retval_.push({
                  added: true,
                  removed: undefined,
                  value: d.value
                });
              } else {
                retval_.push({
                  value: d.value
                });
              }
            }
          } else {
            const t1 = { nodes: Array.prototype.concat.apply([], n1.map((v) => { return v.nodes || [v] }))};
            const t2 = { nodes: Array.prototype.concat.apply([], n2.map((v) => { return v.nodes || [v] }))};
            // Calculate differences recursively if two nodes are similar
            calculateDiff(t1, t2);
          }

          removedNode = null;
          continue;
        } else {
          addDelta(removedNode);
          removedNode = null;
        }
      }
      if (delta.removed) {
        removedNode = delta;
        continue ;
      }

      addDelta(delta);
    }
  }
  calculateDiff({nodes: lTree}, {nodes: rTree});

  // Simplify retval_
  var retval = [];
  var latest = null;
  for (let delta of retval_) {
    if (latest === null) {
      latest = delta;
      continue ;
    }

    if (latest.removed && delta.removed) {
      latest.value += delta.value;
    } else if (latest.added && delta.added) {
      latest.value += delta.value;
    } else if (
      (latest.removed === undefined && latest.added == undefined) &&
      (delta.removed  === undefined && delta.added  == undefined)
    ) {
      latest.value += delta.value;
    } else {
      retval.push(latest);
      latest = delta;
    }
  }
  if (latest !== null) {
    retval.push(latest);
  }

  return retval;
}
