/**
 * Heti add-on v 0.1.0
 * Add right spacing between CJK & ANS characters
 */

import Finder from 'heti-findandreplacedomtext'

// 正则表达式来自 pangu.js https://github.com/vinta/pangu.js
const CJK = '\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30fa\u30fc-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff'
const A = 'A-Za-z\u0370-\u03ff'
const N = '0-9'
const S = '`~!@#\\$%\\^&\\*\\(\\)-_=\\+\\[\\]{}\\\\\\|;:\'",<.>\\/\\?'
const ANS = `${A}${N}${S}`
const HETI_NON_CONTIGUOUS_ELEMENTS = Object.assign({}, Finder.NON_CONTIGUOUS_PROSE_ELEMENTS, {
  // Inline elements
  ins: 1, del: 1, s: 1,
})
const HETI_SKIPPED_ELEMENTS = Object.assign({}, Finder.NON_PROSE_ELEMENTS, {
  pre: 1, code: 1, sup: 1, sub: 1,
  // Heti elements
  'heti-spacing': 1,
})
const HETI_SKIPPED_CLASS = 'heti-skip'
const hasOwn = {}.hasOwnProperty
const REG_FULL = `(?<=[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`
const REG_FULL_FIX = `(?:[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`
const REG_START = `([${ANS}]+(?: +[${ANS}]+)* *)(?=[${CJK}])`
const REG_END = `(?<=[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)*)`
const REG_END_FIX = `(?:[${CJK}])( *[${ANS}]+(?: +[${ANS}]+)*)`

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
    this.REG_FULL = new RegExp(supportLookBehind ? REG_FULL : REG_FULL_FIX, 'g')
    this.REG_START = new RegExp(REG_START, 'g')
    this.REG_END = new RegExp(supportLookBehind ? REG_END : REG_END_FIX, 'g')
    this.offsetWidth = supportLookBehind ? 0 : 1
    this.funcForceContext = function forceContext (el) {
      return hasOwn.call(HETI_NON_CONTIGUOUS_ELEMENTS, el.nodeName.toLowerCase())
      // return true
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

    Finder($$elm, Object.assign({}, commonConfig, {
      find: this.REG_FULL,
      replace: portion => getWrapper('heti-spacing-start heti-spacing-end', portion.text),
      offset: this.offsetWidth,
    }))

    Finder($$elm, Object.assign({}, commonConfig, {
      find: this.REG_START,
      replace: portion => getWrapper('heti-spacing-start', portion.text),
    }))

    Finder($$elm, Object.assign({}, commonConfig, {
      find: this.REG_END,
      replace: portion => getWrapper('heti-spacing-end', portion.text),
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
