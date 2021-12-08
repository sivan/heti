(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.Heti = factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var findAndReplaceDOMText = createCommonjsModule(function (module) {
	/**
	 * findAndReplaceDOMText v 0.4.6
	 * @author James Padolsey http://james.padolsey.com
	 * @license http://unlicense.org/UNLICENSE
	 *
	 * Matches the text of a DOM node against a regular expression
	 * and replaces each match (or node-separated portions of the match)
	 * in the specified element.
	 */
	 (function (root, factory) {
	     if ( module.exports) {
	         // Node/CommonJS
	         module.exports = factory();
	     } else {
	         // Browser globals
	         root.findAndReplaceDOMText = factory();
	     }
	 }(commonjsGlobal, function factory() {

	    var PORTION_MODE_RETAIN = 'retain';
	    var PORTION_MODE_FIRST = 'first';

	    var doc = document;
	    var hasOwn = {}.hasOwnProperty;

	    function escapeRegExp(s) {
	        return String(s).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	    }

	    function exposed() {
	        // Try deprecated arg signature first:
	        return deprecated.apply(null, arguments) || findAndReplaceDOMText.apply(null, arguments);
	    }

	    function deprecated(regex, node, replacement, captureGroup, elFilter) {
	        if ((node && !node.nodeType) && arguments.length <= 2) {
	            return false;
	        }
	        var isReplacementFunction = typeof replacement == 'function';

	        if (isReplacementFunction) {
	            replacement = (function(original) {
	                return function(portion, match) {
	                    return original(portion.text, match.startIndex);
	                };
	            }(replacement));
	        }

	        // Awkward support for deprecated argument signature (<0.4.0)
	        var instance = findAndReplaceDOMText(node, {

	            find: regex,

	            wrap: isReplacementFunction ? null : replacement,
	            replace: isReplacementFunction ? replacement : '$' + (captureGroup || '&'),

	            prepMatch: function(m, mi) {

	                // Support captureGroup (a deprecated feature)

	                if (!m[0]) throw 'findAndReplaceDOMText cannot handle zero-length matches';

	                if (captureGroup > 0) {
	                    var cg = m[captureGroup];
	                    m.index += m[0].indexOf(cg);
	                    m[0] = cg;
	                }

	                m.endIndex = m.index + m[0].length;
	                m.startIndex = m.index;
	                m.index = mi;

	                return m;
	            },
	            filterElements: elFilter
	        });

	        exposed.revert = function() {
	            return instance.revert();
	        };

	        return true;
	    }

	    /**
	     * findAndReplaceDOMText
	     *
	     * Locates matches and replaces with replacementNode
	     *
	     * @param {Node} node Element or Text node to search within
	     * @param {RegExp} options.find The regular expression to match
	     * @param {String|Element} [options.wrap] A NodeName, or a Node to clone
	     * @param {String} [options.wrapClass] A classname to append to the wrapping element
	     * @param {String|Function} [options.replace='$&'] What to replace each match with
	     * @param {Function} [options.filterElements] A Function to be called to check whether to
	     *	process an element. (returning true = process element,
	     *	returning false = avoid element)
	     */
	    function findAndReplaceDOMText(node, options) {
	        return new Finder(node, options);
	    }

	    exposed.NON_PROSE_ELEMENTS = {
	        br:1, hr:1,
	        // Media / Source elements:
	        script:1, style:1, img:1, video:1, audio:1, canvas:1, svg:1, map:1, object:1,
	        // Input elements
	        input:1, textarea:1, select:1, option:1, optgroup: 1, button:1
	    };

	    exposed.NON_CONTIGUOUS_PROSE_ELEMENTS = {

	        // Elements that will not contain prose or block elements where we don't
	        // want prose to be matches across element borders:

	        // Block Elements
	        address:1, article:1, aside:1, blockquote:1, dd:1, div:1,
	        dl:1, fieldset:1, figcaption:1, figure:1, footer:1, form:1, h1:1, h2:1, h3:1,
	        h4:1, h5:1, h6:1, header:1, hgroup:1, hr:1, main:1, nav:1, noscript:1, ol:1,
	        output:1, p:1, pre:1, section:1, ul:1,
	        // Other misc. elements that are not part of continuous inline prose:
	        br:1, li: 1, summary: 1, dt:1, details:1, rp:1, rt:1, rtc:1,
	        // Media / Source elements:
	        script:1, style:1, img:1, video:1, audio:1, canvas:1, svg:1, map:1, object:1,
	        // Input elements
	        input:1, textarea:1, select:1, option:1, optgroup:1, button:1,
	        // Table related elements:
	        table:1, tbody:1, thead:1, th:1, tr:1, td:1, caption:1, col:1, tfoot:1, colgroup:1

	    };

	    exposed.NON_INLINE_PROSE = function(el) {
	        return hasOwn.call(exposed.NON_CONTIGUOUS_PROSE_ELEMENTS, el.nodeName.toLowerCase());
	    };

	    // Presets accessed via `options.preset` when calling findAndReplaceDOMText():
	    exposed.PRESETS = {
	        prose: {
	            forceContext: exposed.NON_INLINE_PROSE,
	            filterElements: function(el) {
	                return !hasOwn.call(exposed.NON_PROSE_ELEMENTS, el.nodeName.toLowerCase());
	            }
	        }
	    };

	    exposed.Finder = Finder;

	    /**
	     * Finder -- encapsulates logic to find and replace.
	     */
	    function Finder(node, options) {

	        // Add offset to fix browsers which don't support regex lookbehind.
	        if (!options.offset) {
	            options.offset = 0;
	        }

	        var preset = options.preset && exposed.PRESETS[options.preset];

	        options.portionMode = options.portionMode || PORTION_MODE_RETAIN;

	        if (preset) {
	            for (var i in preset) {
	                if (hasOwn.call(preset, i) && !hasOwn.call(options, i)) {
	                    options[i] = preset[i];
	                }
	            }
	        }

	        this.node = node;
	        this.options = options;

	        // Enable match-preparation method to be passed as option:
	        this.prepMatch = options.prepMatch || this.prepMatch;

	        this.reverts = [];

	        this.matches = this.search();

	        if (this.matches.length) {
	            this.processMatches();
	        }

	    }

	    Finder.prototype = {

	        /**
	         * Searches for all matches that comply with the instance's 'match' option
	         */
	        search: function() {

	            var match;
	            var matchIndex = 0;
	            var offset = 0;
	            var regex = this.options.find;
	            var textAggregation = this.getAggregateText();
	            var matches = [];
	            var self = this;

	            regex = typeof regex === 'string' ? RegExp(escapeRegExp(regex), 'g') : regex;

	            matchAggregation(textAggregation);

	            function matchAggregation(textAggregation) {
	                for (var i = 0, l = textAggregation.length; i < l; ++i) {

	                    var text = textAggregation[i];

	                    if (typeof text !== 'string') {
	                        // Deal with nested contexts: (recursive)
	                        matchAggregation(text);
	                        continue;
	                    }

	                    if (regex.global) {
	                        while (match = regex.exec(text)) {
	                            matches.push(self.prepMatch(match, matchIndex++, offset));
	                        }
	                    } else {
	                        if (match = text.match(regex)) {
	                            matches.push(self.prepMatch(match, 0, offset));
	                        }
	                    }

	                    offset += text.length;
	                }
	            }

	            return matches;

	        },

	        /**
	         * Prepares a single match with useful meta info:
	         */
	        prepMatch: function(match, matchIndex, characterOffset) {

	            if (!match[0]) {
	                throw new Error('findAndReplaceDOMText cannot handle zero-length matches');
	            }

	            match.endIndex = characterOffset + match.index + match[0].length;
	            match.startIndex = characterOffset + match.index;
	            match.index = matchIndex;

	            return match;
	        },

	        /**
	         * Gets aggregate text within subject node
	         */
	        getAggregateText: function() {

	            var elementFilter = this.options.filterElements;
	            var forceContext = this.options.forceContext;

	            return getText(this.node);

	            /**
	             * Gets aggregate text of a node without resorting
	             * to broken innerText/textContent
	             */
	            function getText(node) {

	                if (node.nodeType === Node.TEXT_NODE) {
	                    return [node.data];
	                }

	                if (elementFilter && !elementFilter(node)) {
	                    return [];
	                }

	                var txt = [''];
	                var i = 0;

	                if (node = node.firstChild) do {

	                    if (node.nodeType === Node.TEXT_NODE) {
	                        txt[i] += node.data;
	                        continue;
	                    }

	                    var innerText = getText(node);

	                    if (
	                        forceContext &&
	                        node.nodeType === Node.ELEMENT_NODE &&
	                        (forceContext === true || forceContext(node))
	                    ) {
	                        txt[++i] = innerText;
	                        txt[++i] = '';
	                    } else {
	                        if (typeof innerText[0] === 'string') {
	                            // Bridge nested text-node data so that they're
	                            // not considered their own contexts:
	                            // I.e. ['some', ['thing']] -> ['something']
	                            txt[i] += innerText.shift();
	                        }
	                        if (innerText.length) {
	                            txt[++i] = innerText;
	                            txt[++i] = '';
	                        }
	                    }
	                } while (node = node.nextSibling);

	                return txt;

	            }

	        },

	        /**
	         * Steps through the target node, looking for matches, and
	         * calling replaceFn when a match is found.
	         */
	        processMatches: function() {

	            var matches = this.matches;
	            var node = this.node;
	            var elementFilter = this.options.filterElements;

	            var startPortion,
	                endPortion,
	                innerPortions = [],
	                curNode = node,
	                match = matches.shift(),
	                atIndex = 0, // i.e. nodeAtIndex
	                portionIndex = 0,
	                doAvoidNode,
	                nodeStack = [node];

	            out: while (true) {

	                if (curNode.nodeType === Node.TEXT_NODE) {

	                    if (!endPortion && curNode.length + atIndex >= match.endIndex) {
	                        // We've found the ending
	                        // (Note that, in the case of a single portion, it'll be an
	                        // endPortion, not a startPortion.)
	                        endPortion = {
	                            node: curNode,
	                            index: portionIndex++,
	                            text: curNode.data.substring(match.startIndex - atIndex + this.options.offset, match.endIndex - atIndex),

	                            // If it's the first match (atIndex==0) we should just return 0
	                            indexInMatch: atIndex === 0 ? 0 : atIndex - match.startIndex,

	                            indexInNode: match.startIndex - atIndex + this.options.offset,
	                            endIndexInNode: match.endIndex - atIndex,
	                            isEnd: true
	                        };

	                    } else if (startPortion) {
	                        // Intersecting node
	                        innerPortions.push({
	                            node: curNode,
	                            index: portionIndex++,
	                            text: curNode.data,
	                            indexInMatch: atIndex - match.startIndex,
	                            indexInNode: 0 // always zero for inner-portions
	                        });
	                    }

	                    if (!startPortion && curNode.length + atIndex > match.startIndex) {
	                        // We've found the match start
	                        startPortion = {
	                            node: curNode,
	                            index: portionIndex++,
	                            indexInMatch: 0,
	                            indexInNode: match.startIndex - atIndex + this.options.offset,
	                            endIndexInNode: match.endIndex - atIndex,
	                            text: curNode.data.substring(match.startIndex - atIndex + this.options.offset, match.endIndex - atIndex)
	                        };
	                    }

	                    atIndex += curNode.data.length;

	                }

	                doAvoidNode = curNode.nodeType === Node.ELEMENT_NODE && elementFilter && !elementFilter(curNode);

	                if (startPortion && endPortion) {

	                    curNode = this.replaceMatch(match, startPortion, innerPortions, endPortion);

	                    // processMatches has to return the node that replaced the endNode
	                    // and then we step back so we can continue from the end of the
	                    // match:

	                    atIndex -= (endPortion.node.data.length - endPortion.endIndexInNode);

	                    startPortion = null;
	                    endPortion = null;
	                    innerPortions = [];
	                    match = matches.shift();
	                    portionIndex = 0;

	                    if (!match) {
	                        break; // no more matches
	                    }

	                } else if (
	                    !doAvoidNode &&
	                    (curNode.firstChild || curNode.nextSibling)
	                ) {
	                    // Move down or forward:
	                    if (curNode.firstChild) {
	                        nodeStack.push(curNode);
	                        curNode = curNode.firstChild;
	                    } else {
	                        curNode = curNode.nextSibling;
	                    }
	                    continue;
	                }

	                // Move forward or up:
	                while (true) {
	                    if (curNode.nextSibling) {
	                        curNode = curNode.nextSibling;
	                        break;
	                    }
	                    curNode = nodeStack.pop();
	                    if (curNode === node) {
	                        break out;
	                    }
	                }

	            }

	        },

	        /**
	         * Reverts ... TODO
	         */
	        revert: function() {
	            // Reversion occurs backwards so as to avoid nodes subsequently
	            // replaced during the matching phase (a forward process):
	            for (var l = this.reverts.length; l--;) {
	                this.reverts[l]();
	            }
	            this.reverts = [];
	        },

	        prepareReplacementString: function(string, portion, match) {
	            var portionMode = this.options.portionMode;
	            if (
	                portionMode === PORTION_MODE_FIRST &&
	                portion.indexInMatch > 0
	            ) {
	                return '';
	            }
	            string = string.replace(/\$(\d+|&|`|')/g, function($0, t) {
	                var replacement;
	                switch(t) {
	                    case '&':
	                        replacement = match[0];
	                        break;
	                    case '`':
	                        replacement = match.input.substring(0, match.startIndex);
	                        break;
	                    case '\'':
	                        replacement = match.input.substring(match.endIndex);
	                        break;
	                    default:
	                        replacement = match[+t] || '';
	                }
	                return replacement;
	            });

	            if (portionMode === PORTION_MODE_FIRST) {
	                return string;
	            }

	            if (portion.isEnd) {
	                return string.substring(portion.indexInMatch);
	            }

	            return string.substring(portion.indexInMatch, portion.indexInMatch + portion.text.length);
	        },

	        getPortionReplacementNode: function(portion, match) {

	            var replacement = this.options.replace || '$&';
	            var wrapper = this.options.wrap;
	            var wrapperClass = this.options.wrapClass;

	            if (wrapper && wrapper.nodeType) {
	                // Wrapper has been provided as a stencil-node for us to clone:
	                var clone = doc.createElement('div');
	                clone.innerHTML = wrapper.outerHTML || new XMLSerializer().serializeToString(wrapper);
	                wrapper = clone.firstChild;
	            }

	            if (typeof replacement == 'function') {
	                replacement = replacement(portion, match);
	                if (replacement && replacement.nodeType) {
	                    return replacement;
	                }
	                return doc.createTextNode(String(replacement));
	            }

	            var el = typeof wrapper == 'string' ? doc.createElement(wrapper) : wrapper;

	             if (el && wrapperClass) {
	                el.className = wrapperClass;
	            }

	            replacement = doc.createTextNode(
	                this.prepareReplacementString(
	                    replacement, portion, match
	                )
	            );

	            if (!replacement.data) {
	                return replacement;
	            }

	            if (!el) {
	                return replacement;
	            }

	            el.appendChild(replacement);

	            return el;
	        },

	        replaceMatch: function(match, startPortion, innerPortions, endPortion) {

	            var matchStartNode = startPortion.node;
	            var matchEndNode = endPortion.node;

	            var precedingTextNode;
	            var followingTextNode;

	            if (matchStartNode === matchEndNode) {

	                var node = matchStartNode;

	                if (startPortion.indexInNode > 0) {
	                    // Add `before` text node (before the match)
	                    precedingTextNode = doc.createTextNode(node.data.substring(0, startPortion.indexInNode));
	                    node.parentNode.insertBefore(precedingTextNode, node);
	                }

	                // Create the replacement node:
	                var newNode = this.getPortionReplacementNode(
	                    endPortion,
	                    match
	                );

	                node.parentNode.insertBefore(newNode, node);

	                if (endPortion.endIndexInNode < node.length) { // ?????
	                    // Add `after` text node (after the match)
	                    followingTextNode = doc.createTextNode(node.data.substring(endPortion.endIndexInNode));
	                    node.parentNode.insertBefore(followingTextNode, node);
	                }

	                node.parentNode.removeChild(node);

	                this.reverts.push(function() {
	                    if (precedingTextNode === newNode.previousSibling) {
	                        precedingTextNode.parentNode.removeChild(precedingTextNode);
	                    }
	                    if (followingTextNode === newNode.nextSibling) {
	                        followingTextNode.parentNode.removeChild(followingTextNode);
	                    }
	                    newNode.parentNode.replaceChild(node, newNode);
	                });

	                return newNode;

	            } else {
	                // Replace matchStartNode -> [innerMatchNodes...] -> matchEndNode (in that order)


	                precedingTextNode = doc.createTextNode(
	                    matchStartNode.data.substring(0, startPortion.indexInNode)
	                );

	                followingTextNode = doc.createTextNode(
	                    matchEndNode.data.substring(endPortion.endIndexInNode)
	                );

	                var firstNode = this.getPortionReplacementNode(
	                    startPortion,
	                    match
	                );

	                var innerNodes = [];

	                for (var i = 0, l = innerPortions.length; i < l; ++i) {
	                    var portion = innerPortions[i];
	                    var innerNode = this.getPortionReplacementNode(
	                        portion,
	                        match
	                    );
	                    portion.node.parentNode.replaceChild(innerNode, portion.node);
	                    this.reverts.push((function(portion, innerNode) {
	                        return function() {
	                            innerNode.parentNode.replaceChild(portion.node, innerNode);
	                        };
	                    }(portion, innerNode)));
	                    innerNodes.push(innerNode);
	                }

	                var lastNode = this.getPortionReplacementNode(
	                    endPortion,
	                    match
	                );

	                matchStartNode.parentNode.insertBefore(precedingTextNode, matchStartNode);
	                matchStartNode.parentNode.insertBefore(firstNode, matchStartNode);
	                matchStartNode.parentNode.removeChild(matchStartNode);

	                matchEndNode.parentNode.insertBefore(lastNode, matchEndNode);
	                matchEndNode.parentNode.insertBefore(followingTextNode, matchEndNode);
	                matchEndNode.parentNode.removeChild(matchEndNode);

	                this.reverts.push(function() {
	                    precedingTextNode.parentNode.removeChild(precedingTextNode);
	                    firstNode.parentNode.replaceChild(matchStartNode, firstNode);
	                    followingTextNode.parentNode.removeChild(followingTextNode);
	                    lastNode.parentNode.replaceChild(matchEndNode, lastNode);
	                });

	                return lastNode;
	            }
	        }

	    };

	    return exposed;

	}));
	});

	/**
	 * Heti add-on v 0.1.0
	 * Add right spacing between CJK & ANS characters
	 */

	const hasOwn = {}.hasOwnProperty;
	const HETI_NON_CONTIGUOUS_ELEMENTS = Object.assign({}, findAndReplaceDOMText.NON_CONTIGUOUS_PROSE_ELEMENTS, {
	  ins: 1, del: 1, s: 1, a: 1,
	});
	const HETI_SKIPPED_ELEMENTS = Object.assign({}, findAndReplaceDOMText.NON_PROSE_ELEMENTS, {
	  pre: 1, code: 1, sup: 1, sub: 1, 'heti-spacing': 1, 'heti-close': 1,
	});
	const HETI_SKIPPED_CLASS = 'heti-skip';

	// 部分正则表达式修改自 pangu.js https://github.com/vinta/pangu.js
	const CJK = '\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30fa\u30fc-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff';
	const A = 'A-Za-z\u0080-\u00ff\u0370-\u03ff';
	const N = '0-9';
	const S = '`~!@#\\$%\\^&\\*\\(\\)-_=\\+\\[\\]{}\\\\\\|;:\'",<.>\\/\\?';
	const ANS = `${A}${N}${S}`;
	const REG_CJK_FULL = `(?<=[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`;
	const REG_CJK_START = `([${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`;
	const REG_CJK_END = `(?<=[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)*)`;
	const REG_CJK_FULL_WITHOUT_LOOKBEHIND = `(?:[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`;
	const REG_CJK_END_WITHOUT_LOOKBEHIND = `(?:[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)*)`;
	const REG_BD_STOP = `。．，、：；！‼？⁇`;
	const REG_BD_SEP = `·・‧`;
	const REG_BD_OPEN = `「『（《〈【〖〔［｛`;
	const REG_BD_CLOSE = `」』）》〉】〗〕］｝`;
	const REG_BD_START = `${REG_BD_OPEN}${REG_BD_CLOSE}`;
	const REG_BD_END = `${REG_BD_STOP}${REG_BD_OPEN}${REG_BD_CLOSE}`;
	const REG_BD_HALF_OPEN = `“‘`;
	const REG_BD_HALF_CLOSE = `”’`;
	const REG_BD_HALF_START = `${REG_BD_HALF_OPEN}${REG_BD_HALF_CLOSE}`;

	class Heti {
	  constructor (rootSelector) {
	    let supportLookBehind = true;

	    try {
	      new RegExp(`(?<=\d)\d`, 'g').test('');
	    } catch (err) {
	      console.info(err.name, '该浏览器尚未实现 RegExp positive lookbehind');
	      supportLookBehind = false;
	    }

	    this.rootSelector = rootSelector || '.heti';
	    this.REG_FULL = new RegExp(supportLookBehind ? REG_CJK_FULL : REG_CJK_FULL_WITHOUT_LOOKBEHIND, 'g');
	    this.REG_START = new RegExp(REG_CJK_START, 'g');
	    this.REG_END = new RegExp(supportLookBehind ? REG_CJK_END : REG_CJK_END_WITHOUT_LOOKBEHIND, 'g');
	    this.offsetWidth = supportLookBehind ? 0 : 1;
	    this.funcForceContext = function forceContext (el) {
	      return hasOwn.call(HETI_NON_CONTIGUOUS_ELEMENTS, el.nodeName.toLowerCase())
	    };
	    this.funcFilterElements = function filterElements (el) {
	      return (
	        !(el.classList && el.classList.contains(HETI_SKIPPED_CLASS)) &&
	        !hasOwn.call(HETI_SKIPPED_ELEMENTS, el.nodeName.toLowerCase())
	      )
	    };
	  }

	  spacingElements (elmList) {
	    for (let $$root of elmList) {
	      this.spacingElement($$root);
	    }
	  }

	  spacingElement ($$elm) {
	    const commonConfig = {
	      forceContext: this.funcForceContext,
	      filterElements: this.funcFilterElements,
	    };
	    const getWrapper = function (elementName, classList, text) {
	      const $$r = document.createElement(elementName);
	      $$r.className = classList;
	      $$r.textContent = text.trim();
	      return $$r
	    };

	    findAndReplaceDOMText($$elm, Object.assign({}, commonConfig, {
	      find: this.REG_FULL,
	      replace: portion => getWrapper('heti-spacing', 'heti-spacing-start heti-spacing-end', portion.text),
	      offset: this.offsetWidth,
	    }));

	    findAndReplaceDOMText($$elm, Object.assign({}, commonConfig, {
	      find: this.REG_START,
	      replace: portion => getWrapper('heti-spacing', 'heti-spacing-start', portion.text),
	    }));

	    findAndReplaceDOMText($$elm, Object.assign({}, commonConfig, {
	      find: this.REG_END,
	      replace: portion => getWrapper('heti-spacing', 'heti-spacing-end', portion.text),
	      offset: this.offsetWidth,
	    }));

	    findAndReplaceDOMText($$elm, Object.assign({}, commonConfig, {
	      find: new RegExp(`([${REG_BD_STOP}])(?=[${REG_BD_START}])|([${REG_BD_OPEN}])(?=[${REG_BD_OPEN}])|([${REG_BD_CLOSE}])(?=[${REG_BD_END}])`,'g'),
	      replace: portion => getWrapper('heti-adjacent', 'heti-adjacent-half', portion.text),
	      offset: this.offsetWidth,
	    }));

	    findAndReplaceDOMText($$elm, Object.assign({}, commonConfig, {
	      find: new RegExp(`([${REG_BD_SEP}])(?=[${REG_BD_OPEN}])|([${REG_BD_CLOSE}])(?=[${REG_BD_SEP}])`,'g'),
	      replace: portion => getWrapper('heti-adjacent', 'heti-adjacent-quarter', portion.text),
	      offset: this.offsetWidth,
	    }));

	    // 使用弯引号的情况下，在停顿符号接弯引号（如「。“」）或弯引号接全角开引号（如“《」）时，间距缩进调整到四分之一
	    findAndReplaceDOMText($$elm, Object.assign({}, commonConfig, {
	      find: new RegExp(`([${REG_BD_STOP}])(?=[${REG_BD_HALF_START}])|([${REG_BD_HALF_OPEN}])(?=[${REG_BD_OPEN}])`,'g'),
	      replace: portion => getWrapper('heti-adjacent', 'heti-adjacent-quarter', portion.text),
	      offset: this.offsetWidth,
	    }));
	  }

	  autoSpacing () {
	    document.addEventListener('DOMContentLoaded', () => {
	      const $$rootList = document.querySelectorAll(this.rootSelector);

	      for (let $$root of $$rootList) {
	        this.spacingElement($$root);
	      }
	    });
	  }
	}

	return Heti;

})));
