export interface Hostname {
  // undefined sets the default behaviour of server.listen
  host: string | undefined
  // resolve to localhost when possible
  name: string
}

export function resolveHostname(
  optionsHost: string | boolean | undefined
): Hostname {
  let host: string | undefined
  if (
    optionsHost === undefined
    || optionsHost === false
    || optionsHost === 'localhost'
  ) {
    // Use a secure default
    host = '127.0.0.1'
  }
  else if (optionsHost === true) {
    // If passed --host in the CLI without arguments
    host = undefined // undefined typically means 0.0.0.0 or :: (listen on all IPs)
  }
  else {
    host = optionsHost
  }

  // Set host name to localhost when possible, unless the user explicitly asked for '127.0.0.1'
  const name
    = (optionsHost !== '127.0.0.1' && host === '127.0.0.1')
      || host === '0.0.0.0'
      || host === '::'
      || host === undefined
      ? 'localhost'
      : host

  return { host, name }
}
