export default function getCommand(packageManager: string, scriptName: string, args?: string): string {
  if (scriptName === 'install') {
    return packageManager === 'yarn' ? 'yarn' : `${packageManager} install`
  }

  if (typeof args !== 'undefined') {
    return packageManager === 'npm'
      ? `npm run ${scriptName} -- ${args}`
      : `${packageManager} ${scriptName} ${args}`
  }
  else {
    return packageManager === 'npm' ? `npm run ${scriptName}` : `${packageManager} ${scriptName}`
  }
}
