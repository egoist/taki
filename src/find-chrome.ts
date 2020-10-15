import fs from 'fs'

const paths: string[] =
  process.platform === 'darwin'
    ? [
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
        process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
        process.env.PROGRAMFILES + '/Google/Chrome/Application/chrome.exe',
        process.env['PROGRAMFILES(X86)'] +
          '/Google/Chrome/Application/chrome.exe',
        process.env.LOCALAPPDATA + '/Chromium/Application/chrome.exe',
        process.env.PROGRAMFILES + '/Chromium/Application/chrome.exe',
        process.env['PROGRAMFILES(X86)'] + '/Chromium/Application/chrome.exe',
      ]
    : [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
      ]

export function findChrome(chromePath?: string): string {
  if (chromePath) {
    paths.push(chromePath);
  }
  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p
    }
  }
  throw new Error(`Cannot find Chrome on your system`)
}
