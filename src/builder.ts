import chalk from 'chalk'
import { execAsync, rimrafAsync } from './async.helpers'

export class Builder {
  constructor(private logger: { log: (string: string) => void, error: (string: string) => void }) {}

  public async build(distPath: string, buildCommand: string): Promise<void> {
    this.logger.log(chalk.yellow(chalk.italic('Building...')))

    try {
      await rimrafAsync(distPath)
      const { stdout } = await execAsync(buildCommand)

      this.logger.log(stdout)
      this.logger.log(chalk.green('\u2713 Project successfully build!'))
    }
    catch (error) {
      this.logger.error(error)
    }
  }
}
