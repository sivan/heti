/**
 * Heti add-on v 0.1.0
 * Add right spacing between CJK & ANS characters
 */

import Finder from 'findandreplacedomtext'

// 正则表达式来自 pangu.js https://github.com/vinta/pangu.js
const CJK = '\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30fa\u30fc-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff'
const A = 'A-Za-z\u0370-\u03ff'
const N = '0-9'
const S = '`~!@#\\$%\\^&\\*\\(\\)-_=\\+\\[\\]{}\\\\\\|;:\'",<.>\\/\\?'
const ANS = `${A}${N}${S}`
const HETI_NON_CONTIGUOUS_ELEMENTS = {
  // Block Elements
  address: 1, article: 1, aside: 1, blockquote: 1, dd: 1, div: 1,
  dl: 1, fieldset: 1, figcaption: 1, figure: 1, footer: 1, form: 1, h1: 1, h2: 1, h3: 1,
  h4: 1, h5: 1, h6: 1, header: 1, hgroup: 1, hr: 1, main: 1, nav: 1, noscript: 1, ol: 1,
  output: 1, p: 1, pre: 1, section: 1, ul: 1,
  // Other misc. elements that are not part of continuous inline prose:
  br: 1, li: 1, summary: 1, dt: 1, details: 1, rp: 1, rt: 1, rtc: 1,
  // Media / Source elements:
  script: 1, style: 1, img: 1, video: 1, audio: 1, canvas: 1, svg: 1, map: 1, object: 1,
  // Input elements
  input: 1, textarea: 1, select: 1, option: 1, optgroup: 1, button: 1,
  // Table related elements:
  table: 1, tbody: 1, thead: 1, th: 1, tr: 1, td: 1, caption: 1, col: 1, tfoot: 1, colgroup: 1,
  // Inline elements
  ins: 1, del: 1, s: 1,
}
const HETI_SKIPPED_ELEMENTS = {
  br: 1, hr: 1,
  // Media / Source elements:
  script: 1, style: 1, img: 1, video: 1, audio: 1, canvas: 1, svg: 1, map: 1, object: 1,
  // Input elements:
  input: 1, textarea: 1, select: 1, option: 1, optgroup: 1, button: 1,
  // Pre elements:
  pre: 1, code: 1, sup: 1, sub: 1,
  // Heti elements
  'heti-spacing': 1,
}
const HETI_SKIPPED_CLASS = 'heti-skip'
const hasOwn = {}.hasOwnProperty

class Heti {
  constructor (rootSelector) {
    this.rootSelector = rootSelector || '.heti'
    this.REG_FULL = new RegExp(`(?<=[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`, 'g')
    this.REG_START = new RegExp(`([${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`, 'g')
    this.REG_END = new RegExp(`(?<=[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)*)`, 'g')
    this.funcForceContext = function forceContext (el) {
      return hasOwn.call(HETI_NON_CONTIGUOUS_ELEMENTS, el.nodeName.toLowerCase())
    }
    this.funcFilterElements = function filterElements (el) {
      return (
        !(el.classList && el.classList.contains(HETI_SKIPPED_CLASS)) &&
        !hasOwn.call(HETI_SKIPPED_ELEMENTS, el.nodeName.toLowerCase())
      )
    }
  }

  spacingElements (elmList) {
    for (let $$root of elmList) {
      this.spacingElement($$root)
    }
  }

  spacingElement ($$elm) {
    const commonConfig = {
      forceContext: this.funcForceContext,
      filterElements: this.funcFilterElements,
    }
    const getWrapper = function (classList, text) {
      const $$r = document.createElement('heti-spacing')
      $$r.className = classList
      $$r.textContent = text.trim()
      return $$r
    }

    Finder($$elm, Object.assign(commonConfig, {
      find: this.REG_FULL,
      replace: portion => getWrapper('heti-spacing-start heti-spacing-end', portion.text),
    }))

    Finder($$elm, Object.assign(commonConfig, {
      find: this.REG_START,
      replace: portion => getWrapper('heti-spacing-start', portion.text),
    }))

    Finder($$elm, Object.assign(commonConfig, {
      find: this.REG_END,
      replace: portion => getWrapper('heti-spacing-end', portion.text),
    }))
  }

  autoSpacing () {
    document.addEventListener('DOMContentLoaded', () => {
      const $$rootList = document.querySelectorAll(this.rootSelector)

      for (let $$root of $$rootList) {
        this.spacingElement($$root)
      }
    })
  }
}

export default Heti
