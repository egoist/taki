import fs from 'fs'

const mac = process.platform === 'darwin'
const win = process.platform === 'win32'

export function findChrome() {
  if (mac) {
    const regPath =
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

    return fs.existsSync(regPath) ? regPath : null
  }

  if (win) {
    const suffix = '\\Google\\Chrome\\Application\\chrome.exe'
    const prefixes = [
      process.env.LOCALAPPDATA,
      process.env.PROGRAMFILES,
      process.env['PROGRAMFILES(X86)'],
    ]

    for (let i = 0; i < prefixes.length; i++) {
      const exe = prefixes[i] + suffix
      if (fs.existsSync(exe)) {
        return exe
        break
      }
    }
  }

  try {
    return require('which').sync('google-chrome')
  } catch (err) {
    return null
  }
}
