import * as core from '@actions/core'
import {
  JiraContext,
  JiraIssue,
  JiraVersion,
  SearchedJiraIssue,
  listProjectVersions,
  searchIssues,
  updateIssue
} from './jiraApi'

export const updateJira = async (
  context: JiraContext,
  issueKeys: string[],
  fixVersion: string
): Promise<void> => {
  if (!issueKeys || issueKeys.length === 0) {
    return
  }
  core.info(`fixVersion:[${fixVersion}]`)
  const issuesWithSubTasks = await filterIssuesWithoutCurrentFixVersion(
    context,
    issueKeys,
    fixVersion
  )
  core.info(
    `issuesWithSubTasks:[${issuesWithSubTasks
      .map(issue => issue.key)
      .join(',')}]`
  )
  const issuesKeysWithoutSubTasks = issuesWithSubTasks.map(issue => {
    if (issue.fields.issuetype?.subtask && issue.fields.parent) {
      return issue.fields.parent.key
    } else {
      return issue.key
    }
  })
  core.info(
    `issuesKeysWithoutSubTasks:[${issuesKeysWithoutSubTasks.join(',')}]`
  )
  const issues = await filterIssuesWithoutCurrentFixVersion(
    context,
    issuesKeysWithoutSubTasks,
    fixVersion
  )
  if (!issues || issues.length === 0) {
    return
  }
  const currentIssueKeys = issues.map(issue => issue.key)
  core.info(`currentIssueKeys:[${currentIssueKeys.join(',')}]`)
  const {projectsKeys} = context
  const fixVersionUpdates: JiraIssue[] = []
  for (const projectKey of projectsKeys) {
    const version = await getJiraVersion(context, fixVersion, projectKey)
    const fixVersionUpdate: JiraIssue = {
      update: {
        fixVersions: [
          {
            add: {id: version.id}
          }
        ]
      }
    }
    fixVersionUpdates.push(fixVersionUpdate)
  }

  for (const issueKey of currentIssueKeys) {
    core.info(`start updateIssue:[${issueKey}]`)
    let index = 0
    for (let i = 0; i < projectsKeys.length; i++) {
      if (issueKey.startsWith(projectsKeys[i])) {
        index = i
        break
      }
    }
    await updateIssue(context, issueKey, fixVersionUpdates[index])
  }
}

const filterIssuesWithoutCurrentFixVersion = async (
  context: JiraContext,
  issueKeys: string[],
  fixVersion: string
): Promise<SearchedJiraIssue[]> => {
  const {projectsKeys} = context
  const groupedIssues = issueKeys.join(',')
  const searchIssuesWithoutCurrentFixVersion = `project in (${projectsKeys.join(
    ','
  )}) AND (fixVersion not in (${fixVersion}) OR fixVersion is EMPTY) AND issuekey in (${groupedIssues})`
  core.info(`searchIssuesQuery:[${searchIssuesWithoutCurrentFixVersion}]`)
  return await searchIssues(context, searchIssuesWithoutCurrentFixVersion, [
    'summary',
    'issuetype',
    'parent'
  ])
}

export const getJiraVersion = async (
  context: JiraContext,
  fixVersion: string,
  projectKey: string
): Promise<JiraVersion> => {
  const versions = await listProjectVersions(context, projectKey)
  const result = versions.filter(i => i.name === fixVersion)
  let version: JiraVersion
  if (!result || result.length === 0) {
    throw new Error(
      `version [${fixVersion}] not found in project [${projectKey}]`
    )
  } else {
    version = result[0]
    core.info(`version found:[${version.id}]`)
  }
  return version
}
