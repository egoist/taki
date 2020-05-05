import ts from 'rollup-plugin-typescript2'

export default {
  input: {
    index: 'src/index.ts'
  },
  output: {
    dir: `${__dirname}/dist`,
    format: 'cjs'
  },
  plugins: [
    ts({
      tsconfigOverride: {
        compilerOptions: {
          module: 'esnext'
        }
      }
    })
  ]
}
