import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('GITHUB_TOKEN', {required: true})

    github.getOctokit(githubToken)
    core.info(`GITHUB_EVENT_NAME=${process.env.GITHUB_EVENT_NAME}`)
    core.info(`GITHUB context action=${github.context.payload.action}`)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    core.setFailed(error.message)
  }
}

run()
