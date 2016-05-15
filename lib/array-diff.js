'use strict';

const diff = require('diff');

module.exports = function (arr1, arr2, equals) {
  var count = 0;
  const uniqueId = () => {return `${++count}`};

  // Convert from arrays to strings because jsdiff can only deal with strings
  const idMap = new Map();
  const valueMap = new Map();

  const addId = (elem) => {
    const id = uniqueId();
    idMap.set(elem, id);
    valueMap.set(id, elem);
    return id;
  }
  const convertToString = (arr) => {
    let string = '';
    for (let elem of arr) {
      let id = undefined;
      if (equals === undefined || equals === null) {
        if (!idMap.has(elem)) {
          id = addId(elem);
        } else {
          id = idMap.get(elem);
        }
      } else {
        let contains = false;
        idMap.forEach((value, key, map) => {
          if (equals(key, elem)) {
            id = value;
            contains = true;
          }
        })
        if (!contains) {
          id = addId(elem);
        }
      }
      string += `${id}\n`;
    }
    return string;
  }

  var string1 = convertToString(arr1);
  var string2 = convertToString(arr2);

  // Calculate the difference between two strings
  const d = diff.diffLines(string1, string2);

  var retval = [];
  for (let delta of d) {
    const ids = delta.value.split('\n').filter((elem, index, array) => { return elem !== ''; });
    const elems = ids.map((elem, index, array) => {
      return valueMap.get(elem);
    });

    if (delta.added) {
      retval.push({
        added: true,
        removed: undefined,
        value: elems
      })
    } else if (delta.removed) {
      retval.push({
        added: undefined,
        removed: true,
        value: elems
      });
    } else {
      retval.push({
        value: elems
      });
    }
  }

  return retval;
}
