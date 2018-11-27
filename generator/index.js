const fs = require('fs')
const path = require('path')
const copy = require('recursive-copy')
const glob = require('glob-promise')

const markdown = require('markdown-it')({
  html: true,
  typographer: true,
  linkify: true
})

const base = (...args) => path.join(__dirname, '..', ...args)
const layout = readSrc('layout.html')

glob(base('src', '*.md'))
  .then(function(files) {
    return Promise.all(
      files.map(function(file) {
        const base = path.basename(file, '.md')
        return renderMarkdown(base)
      })
    )
  })
  .then(copyFiles)

function readSrc(filename) {
  return fs.readFileSync(base('src', filename)).toString('utf8')
}

function renderMarkdown(filename) {
  const text = md.render(readSrc(`${filename}.md`))
  const result = template(layout, { CONTENT: text })
  fs.writeFileSync(base('docs', `${filename}.html`), result)
  console.log(`Created ${filename}.html`)
}

function copyFiles() {
  copy(base('src', 'static'), base('docs', 'static'), {
    overwrite: true
  })
    .then(function(results) {
      console.info(`Copied public files (${results.length} files)`)
    })
    .catch(function(error) {
      console.error('Error copying public files: ', error)
    })
}

function template(text, obj) {
  return text.replace(
    /\{\{([A-Z]+)\}\}/g,
    (_, key) => obj[key] || ''
  )
}
