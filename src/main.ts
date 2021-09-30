import * as core from '@actions/core'
import * as github from '@actions/github'
import {onPush} from './eventHandler'

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('GITHUB_TOKEN', {required: true})
    const fixVersionOverride = core.getInput('FIX_VERSION_OVERRIDE')
    const versionSettingFilePath = core.getInput('VERSION_SETTING_FILE_PATH')
    const tagPrefix = core.getInput('TAG_PREFIX')
    const versionPrefix = core.getInput('VERSION_PREFIX')

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
      subDomain: core.getInput('JIRA_SUBDOMAIN', {required: true}),
      email: core.getInput('JIRA_USER', {required: true}),
      token: core.getInput('JIRA_TOKEN', {required: true}),
      projectsKeys: core
        .getInput('JIRA_PROJECTS_KEYS', {required: true})
        .split(',')
    }
    if (process.env.GITHUB_EVENT_NAME === 'push') {
      core.info(`start onPush`)
      await onPush(
        gitHubContext,
        jiraContext,
        fixVersionOverride,
        versionSettingFilePath,
        tagPrefix,
        versionPrefix
      )
      core.info(`onPush finished`)
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    core.setFailed(error.message)
  }
}

run()
