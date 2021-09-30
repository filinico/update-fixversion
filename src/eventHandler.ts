import * as core from '@actions/core'
import {GitHubContext, getRevisionFromOldestCommit} from './gitHubApi'
import {
  extractIssuesFromCommitMessage,
  getPRIdFromCommit
} from './commitMessageExtraction'
import {JiraContext} from './jiraApi'
import {extractJiraIssues} from './gitRepo'
import {getFixVersionFromVersionSetting} from './versionSetting'
import {updateJira} from './jiraUpdate'

export const onPush = async (
  actionContext: GitHubContext,
  jiraContext: JiraContext,
  fixVersionOverride: string,
  versionSettingFilePath: string,
  tagPrefix: string,
  versionPrefix: string
): Promise<void> => {
  const {context, workspace} = actionContext
  const {
    payload: {
      head_commit: {id, message}
    }
  } = context
  const {projectsKeys} = jiraContext
  let extractedJiraIssues: string[]
  const prId = getPRIdFromCommit(message)
  if (!prId) {
    extractedJiraIssues = extractIssuesFromCommitMessage(message, projectsKeys)
  } else {
    const oldestCommitRef = await getRevisionFromOldestCommit(
      actionContext,
      parseInt(prId)
    )
    if (!oldestCommitRef) {
      extractedJiraIssues = extractIssuesFromCommitMessage(
        message,
        projectsKeys
      )
    } else {
      const oldestCommitRevision = oldestCommitRef.sha
      const oldestCommitMessage = oldestCommitRef.commit.message
      const extractedJiraIssuesFromCommit = extractIssuesFromCommitMessage(
        oldestCommitMessage,
        projectsKeys
      )
      if (oldestCommitRevision !== id) {
        const extractedJiraIssuesFromLogs = await extractJiraIssues(
          oldestCommitRevision,
          id,
          workspace,
          projectsKeys.join(',')
        )
        extractedJiraIssues = [
          ...new Set(
            extractedJiraIssuesFromCommit.concat(extractedJiraIssuesFromLogs)
          )
        ]
      } else {
        extractedJiraIssues = extractedJiraIssuesFromCommit
      }
    }
  }
  core.info(`extractedJiraIssues=${extractedJiraIssues.join(',')}`)
  if (!extractedJiraIssues.length) {
    core.info('No Jira issues extracted.')
    return
  }
  let fixVersion: string
  if (fixVersionOverride !== '') {
    fixVersion = fixVersionOverride
  } else {
    fixVersion = getFixVersionFromVersionSetting(
      versionSettingFilePath,
      tagPrefix,
      versionPrefix,
      workspace
    )
  }
  await updateJira(jiraContext, extractedJiraIssues, fixVersion)
}
