'use strict';

/**
 * Returns the array of 32 compass points and heading.
 * See details here:
 * https://en.wikipedia.org/wiki/Points_of_the_compass#32_cardinal_points
 *
 * @return {array}
 *
 * Example of return :
 *  [
 *     { abbreviation : 'N',     azimuth : 0.00 ,
 *     { abbreviation : 'NbE',   azimuth : 11.25 },
 *     { abbreviation : 'NNE',   azimuth : 22.50 },
 *       ...
 *     { abbreviation : 'NbW',   azimuth : 348.75 }
 *  ]
 */
function createCompassPoints() {
    const sides = ['N', 'E', 'S', 'W'];
    const result = [];
    const getAbbreviation = (i) => {
        const main = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const points = [];
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 8; k++) {
                const idx = (k + j * 8) % 32;
                points[idx] = main[k].replace('N', sides[j])
                                     .replace('S', sides[(j + 2) % 4])
                                     .replace('E', sides[(j + 1) % 4])
                                     .replace('W', sides[(j + 3) % 4]);
            }
        }
        return points[i];
    };

    for (let i = 0; i < 32; i++) {
        const angle = i * 11.25;
        const abbreviations = ['N','NbE','NNE','NEbN','NE','NEbE','ENE','EbN',
                               'E','EbS','ESE','SEbE','SE','SEbS','SSE','SbE',
                               'S','SbW','SSW','SWbS','SW','SWbW','WSW','WbS',
                               'W','WbN','WNW','NWbW','NW','NWbN','NNW','NbW'];
        result.push({ abbreviation: abbreviations[i], azimuth: angle });
    }
    return result;
}


/**
 * Expand the braces of the specified string.
 * See https://en.wikipedia.org/wiki/Bash_(Unix_shell)#Brace_expansion
 *
 * In the input string, balanced pairs of braces containing comma-separated substrings
 * represent alternations that specify multiple alternatives which are to appear at that position in the output.
 *
 * @param {string} str
 * @return {Iterable.<string>}
 *
 * NOTE: The order of output string does not matter.
 *
 * Example:
 *   '~/{Downloads,Pictures}/*.{jpg,gif,png}'  => '~/Downloads/*.jpg',
 *                                                '~/Downloads/*.gif'
 *                                                '~/Downloads/*.png',
 *                                                '~/Pictures/*.jpg',
 *                                                '~/Pictures/*.gif',
 *                                                '~/Pictures/*.png'
 *
 *   'It{{em,alic}iz,erat}e{d,}, please.'  => 'Itemized, please.',
 *                                            'Itemize, please.',
 *                                            'Italicized, please.',
 *                                            'Italicize, please.',
 *                                            'Iterated, please.',
 *                                            'Iterate, please.'
 *
 *   'thumbnail.{png,jp{e,}g}'  => 'thumbnail.png'
 *                                 'thumbnail.jpeg'
 *                                 'thumbnail.jpg'
 *
 *   'nothing to do' => 'nothing to do'
 */
function* expandBraces(str) {
    function expand(s) {
        const stack = [];
        let i = 0;

        while (i < s.length) {
            if (s[i] === '{') {
                let openIndex = i;
                let level = 1;
                i++;

                while (i < s.length && level > 0) {
                    if (s[i] === '{') level++;
                    else if (s[i] === '}') level--;
                    i++;
                }

                if (level !== 0) throw new Error('Unbalanced braces');

                const inner = s.slice(openIndex + 1, i - 1);
                const variants = splitCommaSafe(inner);

                const prefix = s.slice(0, openIndex);
                const suffix = s.slice(i);

                const expanded = [];
                for (const variant of variants) {
                    for (const tail of expand(suffix)) {
                        expanded.push(prefix + variant + tail);
                    }
                }

                return expanded;
            }

            i++;
        }

        return [s];
    }

    function splitCommaSafe(s) {
        const result = [];
        let braceLevel = 0;
        let current = '';

        for (let ch of s) {
            if (ch === ',' && braceLevel === 0) {
                result.push(current);
                current = '';
            } else {
                if (ch === '{') braceLevel++;
                if (ch === '}') braceLevel--;
                current += ch;
            }
        }
        result.push(current);
        return result;
    }

    const seen = new Set();
    for (const val of expand(str)) {
        if (!seen.has(val)) {
            seen.add(val);
            yield val;
        }
    }
}


/**
 * Returns the ZigZag matrix
 *
 * The fundamental idea in the JPEG compression algorithm is to sort coefficient of given image by zigzag path and encode it.
 * In this task you are asked to implement a simple method to create a zigzag square matrix.
 * See details at https://en.wikipedia.org/wiki/JPEG#Entropy_coding
 * and zigzag path here: https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/JPEG_ZigZag.svg/220px-JPEG_ZigZag.svg.png
 *
 * @param {number} n - matrix dimension
 * @return {array}  n x n array of zigzag path
 *
 * @example
 *   1  => [[0]]
 *
 *   2  => [[ 0, 1 ],
 *          [ 2, 3 ]]
 *
 *         [[ 0, 1, 5 ],
 *   3  =>  [ 2, 4, 6 ],
 *          [ 3, 7, 8 ]]
 *
 *         [[ 0, 1, 5, 6 ],
 *   4 =>   [ 2, 4, 7,12 ],
 *          [ 3, 8,11,13 ],
 *          [ 9,10,14,15 ]]
 *
 */
function getZigZagMatrix(n) {
    const result = Array.from({ length: n }, () => Array(n).fill(0));
    let i = 0, j = 0;
    for (let num = 0; num < n * n; num++) {
        result[i][j] = num;
        if ((i + j) % 2 === 0) {
            if (j + 1 < n) j++;
            else i += 2;
            if (i > 0) i--;
        } else {
            if (i + 1 < n) i++;
            else j += 2;
            if (j > 0) j--;
        }
    }
    return result;
}


/**
 * Returns true if specified subset of dominoes can be placed in a row accroding to the game rules.
 * Dominoes details see at: https://en.wikipedia.org/wiki/Dominoes
 *
 * Each domino tile presented as an array [x,y] of tile value.
 * For example, the subset [1, 1], [2, 2], [1, 2] can be arranged in a row (as [1, 1] followed by [1, 2] followed by [2, 2]),
 * while the subset [1, 1], [0, 3], [1, 4] can not be arranged in one row.
 * NOTE that as in usual dominoes playing any pair [i, j] can also be treated as [j, i].
 *
 * @params {array} dominoes
 * @return {bool}
 *
 * @example
 *
 * [[0,1],  [1,1]] => true
 * [[1,1], [2,2], [1,5], [5,6], [6,3]] => false
 * [[1,3], [2,3], [1,4], [2,4], [1,5], [2,5]]  => true
 * [[0,0], [0,1], [1,1], [0,2], [1,2], [2,2], [0,3], [1,3], [2,3], [3,3]] => false
 *
 */
function canDominoesMakeRow(dominoes) {
    if (dominoes.length === 0) return true;

    const graph = new Map();

    // Заполняем граф
    for (let [a, b] of dominoes) {
        if (!graph.has(a)) graph.set(a, []);
        if (!graph.has(b)) graph.set(b, []);
        graph.get(a).push(b);
        graph.get(b).push(a);
    }

    // Проверим степень каждой вершины
    const oddDegrees = [...graph.values()].filter(neigh => neigh.length % 2 === 1).length;

    if (oddDegrees !== 0 && oddDegrees !== 2) return false;

    // Проверим связность (DFS)
    const visited = new Set();
    const keys = [...graph.keys()];

    function dfs(v) {
        visited.add(v);
        for (let neigh of graph.get(v)) {
            if (!visited.has(neigh)) dfs(neigh);
        }
    }

    dfs(keys[0]);

    const connected = keys.every(v => visited.has(v));
    return connected;
}



/**
 * Returns the string expression of the specified ordered list of integers.
 *
 * A format for expressing an ordered list of integers is to use a comma separated list of either:
 *   - individual integers
 *   - or a range of integers denoted by the starting integer separated from the end integer in the range by a dash, '-'.
 *     (The range includes all integers in the interval including both endpoints)
 *     The range syntax is to be used only for, and for every range that expands to more than two values.
 *
 * @params {array} nums
 * @return {bool}
 *
 * @example
 *
 * [ 0, 1, 2, 3, 4, 5 ]   => '0-5'
 * [ 1, 4, 5 ]            => '1,4,5'
 * [ 0, 1, 2, 5, 7, 8, 9] => '0-2,5,7-9'
 * [ 1, 2, 4, 5]          => '1,2,4,5'
 */
function extractRanges(nums) {
    let result = '';
    for (let i = 0; i < nums.length;) {
        let j = i;
        while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
        if (j - i >= 2) {
            result += `${nums[i]}-${nums[j]},`;
            i = j + 1;
        } else {
            result += `${nums[i]},`;
            i++;
        }
    }
    return result.slice(0, -1);
}

module.exports = {
    createCompassPoints : createCompassPoints,
    expandBraces : expandBraces,
    getZigZagMatrix : getZigZagMatrix,
    canDominoesMakeRow : canDominoesMakeRow,
    extractRanges : extractRanges
};
