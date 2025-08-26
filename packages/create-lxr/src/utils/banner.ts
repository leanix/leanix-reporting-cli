import gradientString from 'gradient-string'
import pkg from '../../package.json' assert { type: 'json' }

const gradient = gradientString([
  { color: '#42d392', pos: 0 },
  { color: '#42d392', pos: 0.1 },
  { color: '#647eff', pos: 1 }
])

const banner = gradient(`LeanIX Custom Report Scaffolding Tool v${pkg.version}`)

export default banner
