/**
 * LaTeX 公式渲染工具
 * 统一使用 KaTeX 渲染 LaTeX 公式，供所有页面复用
 */
import katex from 'katex'

/**
 * 渲染内容中的 LaTeX 公式
 * 支持行内公式 $...$ 和块级公式 $$...$$
 * 
 * @param {string} content 原始内容
 * @returns {string} 渲染后的 HTML 字符串
 */
export function renderLatexContent(content) {
  if (!content) return ''

  // 先渲染块级公式 $$...$$
  let html = content.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => {
    try {
      return katex.renderToString(latex.trim(), { 
        throwOnError: false, 
        displayMode: true 
      })
    } catch {
      return match
    }
  })

  // 再渲染行内公式 $...$（排除已经被处理的 $$ 块）
  html = html.replace(/\$(.+?)\$/g, (match, latex) => {
    try {
      return katex.renderToString(latex.trim(), { 
        throwOnError: false, 
        displayMode: false 
      })
    } catch {
      return match
    }
  })

  return html
}

export { katex }
