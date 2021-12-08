/**
 * Heti add-on v 0.1.0
 * Add right spacing between CJK & ANS characters
 */

import Finder from 'heti-findandreplacedomtext'

const hasOwn = {}.hasOwnProperty
const HETI_NON_CONTIGUOUS_ELEMENTS = Object.assign({}, Finder.NON_CONTIGUOUS_PROSE_ELEMENTS, {
  ins: 1, del: 1, s: 1, a: 1,
})
const HETI_SKIPPED_ELEMENTS = Object.assign({}, Finder.NON_PROSE_ELEMENTS, {
  pre: 1, code: 1, sup: 1, sub: 1, 'heti-spacing': 1, 'heti-close': 1,
})
const HETI_SKIPPED_CLASS = 'heti-skip'

// 部分正则表达式修改自 pangu.js https://github.com/vinta/pangu.js
const CJK = '\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30fa\u30fc-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff'
const A = 'A-Za-z\u0080-\u00ff\u0370-\u03ff'
const N = '0-9'
const S = '`~!@#\\$%\\^&\\*\\(\\)-_=\\+\\[\\]{}\\\\\\|;:\'",<.>\\/\\?'
const ANS = `${A}${N}${S}`
const REG_CJK_FULL = `(?<=[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`
const REG_CJK_START = `([${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`
const REG_CJK_END = `(?<=[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)*)`
const REG_CJK_FULL_WITHOUT_LOOKBEHIND = `(?:[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`
const REG_CJK_END_WITHOUT_LOOKBEHIND = `(?:[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)*)`
const REG_BD_STOP = `。．，、：；！‼？⁇`
const REG_BD_SEP = `·・‧`
const REG_BD_OPEN = `「『（《〈【〖〔［｛`
const REG_BD_CLOSE = `」』）》〉】〗〕］｝`
const REG_BD_START = `${REG_BD_OPEN}${REG_BD_CLOSE}`
const REG_BD_END = `${REG_BD_STOP}${REG_BD_OPEN}${REG_BD_CLOSE}`
const REG_BD_HALF_OPEN = `“‘`
const REG_BD_HALF_CLOSE = `”’`
const REG_BD_HALF_START = `${REG_BD_HALF_OPEN}${REG_BD_HALF_CLOSE}`

class Heti {
  constructor (rootSelector) {
    let supportLookBehind = true

    try {
      new RegExp(`(?<=\d)\d`, 'g').test('')
    } catch (err) {
      console.info(err.name, '该浏览器尚未实现 RegExp positive lookbehind')
      supportLookBehind = false
    }

    this.rootSelector = rootSelector || '.heti'
    this.REG_FULL = new RegExp(supportLookBehind ? REG_CJK_FULL : REG_CJK_FULL_WITHOUT_LOOKBEHIND, 'g')
    this.REG_START = new RegExp(REG_CJK_START, 'g')
    this.REG_END = new RegExp(supportLookBehind ? REG_CJK_END : REG_CJK_END_WITHOUT_LOOKBEHIND, 'g')
    this.offsetWidth = supportLookBehind ? 0 : 1
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
    const getWrapper = function (elementName, classList, text) {
      const $$r = document.createElement(elementName)
      $$r.className = classList
      $$r.textContent = text.trim()
      return $$r
    }

    Finder($$elm, Object.assign({}, commonConfig, {
      find: this.REG_FULL,
      replace: portion => getWrapper('heti-spacing', 'heti-spacing-start heti-spacing-end', portion.text),
      offset: this.offsetWidth,
    }))

    Finder($$elm, Object.assign({}, commonConfig, {
      find: this.REG_START,
      replace: portion => getWrapper('heti-spacing', 'heti-spacing-start', portion.text),
    }))

    Finder($$elm, Object.assign({}, commonConfig, {
      find: this.REG_END,
      replace: portion => getWrapper('heti-spacing', 'heti-spacing-end', portion.text),
      offset: this.offsetWidth,
    }))

    Finder($$elm, Object.assign({}, commonConfig, {
      find: new RegExp(`([${REG_BD_STOP}])(?=[${REG_BD_START}])|([${REG_BD_OPEN}])(?=[${REG_BD_OPEN}])|([${REG_BD_CLOSE}])(?=[${REG_BD_END}])`,'g'),
      replace: portion => getWrapper('heti-adjacent', 'heti-adjacent-half', portion.text),
      offset: this.offsetWidth,
    }))

    Finder($$elm, Object.assign({}, commonConfig, {
      find: new RegExp(`([${REG_BD_SEP}])(?=[${REG_BD_OPEN}])|([${REG_BD_CLOSE}])(?=[${REG_BD_SEP}])`,'g'),
      replace: portion => getWrapper('heti-adjacent', 'heti-adjacent-quarter', portion.text),
      offset: this.offsetWidth,
    }))

    // 使用弯引号的情况下，在停顿符号接弯引号（如「。“」）或弯引号接全角开引号（如“《」）时，间距缩进调整到四分之一
    Finder($$elm, Object.assign({}, commonConfig, {
      find: new RegExp(`([${REG_BD_STOP}])(?=[${REG_BD_HALF_START}])|([${REG_BD_HALF_OPEN}])(?=[${REG_BD_OPEN}])`,'g'),
      replace: portion => getWrapper('heti-adjacent', 'heti-adjacent-quarter', portion.text),
      offset: this.offsetWidth,
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
