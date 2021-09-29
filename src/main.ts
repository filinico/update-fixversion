import * as core from '@actions/core'
import * as github from '@actions/github'
import {onPush} from './eventHandler'

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('GITHUB_TOKEN', {required: true})

    if (!process.env.GITHUB_WORKSPACE) {
      core.setFailed(
        'Please use the "actions/checkout" action to checkout your repository.'
      )
      return
    }

    core.info(`GITHUB_WORKSPACE=${process.env.GITHUB_WORKSPACE}`)
    core.info(`Current dir=${__dirname}`)
    core.info(`GITHUB_EVENT_NAME=${process.env.GITHUB_EVENT_NAME}`)
    core.info(`GITHUB context action=${github.context.payload.action}`)

    const octokit = github.getOctokit(githubToken)
    const gitHubContext = {
      octokit,
      context: github.context,
      workspace: process.env.GITHUB_WORKSPACE
    }
    const jiraContext = {
      projectsKeys: core.getInput('JIRA_PROJECTS_KEYS', {required: true})
    }
    if (process.env.GITHUB_EVENT_NAME === 'push') {
      core.info(`start onPush`)
      await onPush(gitHubContext, jiraContext)
      core.info(`onPush finished`)
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    core.setFailed(error.message)
  }
}

run()
