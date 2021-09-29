import * as core from '@actions/core'
import {GitHubContext, getRevisionFromOldestCommit} from './gitHubApi'
import {
  extractIssuesFromCommitMessage,
  getPRIdFromCommit
} from './commitMessageExtraction'
import {extractJiraIssues} from './gitRepo'

export interface JiraContext {
  projectsKeys: string
}

export const onPush = async (
  actionContext: GitHubContext,
  jiraContext: JiraContext
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
    extractedJiraIssues = extractIssuesFromCommitMessage(
      message,
      projectsKeys.split(',')
    )
  } else {
    const oldestCommitRevision = await getRevisionFromOldestCommit(
      actionContext,
      parseInt(prId)
    )
    extractedJiraIssues = await extractJiraIssues(
      oldestCommitRevision,
      id,
      workspace,
      projectsKeys
    )
  }
  core.info(`extractedJiraIssues=${extractedJiraIssues.join(',')}`)
}
