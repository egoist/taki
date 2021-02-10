import fs from 'fs'

const { CHROME_PATH } = process.env

const paths: (string | undefined)[] =
  process.platform === 'darwin'
    ? [
        CHROME_PATH,
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
      ]
    : process.platform === 'win32'
    ? [
        CHROME_PATH,
        process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
        process.env.PROGRAMFILES + '/Google/Chrome/Application/chrome.exe',
        process.env['PROGRAMFILES(X86)'] +
          '/Google/Chrome/Application/chrome.exe',
        process.env.LOCALAPPDATA + '/Chromium/Application/chrome.exe',
        process.env.PROGRAMFILES + '/Chromium/Application/chrome.exe',
        process.env['PROGRAMFILES(X86)'] + '/Chromium/Application/chrome.exe',
      ]
    : [
        CHROME_PATH,
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
      ]

export function findChrome(): string {
  for (const p of paths) {
    if (p && fs.existsSync(p)) {
      return p
    }
  }
  throw new Error(`Cannot find Chrome on your system`)
}
