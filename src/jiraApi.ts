import * as core from '@actions/core'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, {AxiosError} from 'axios'

export interface JiraContext {
  subDomain: string
  email: string
  token: string
  projectsKeys: string[]
}

interface AuthHeaders {
  headers: {
    Authorization: string
    Accept: string
  }
}

export interface JiraIssues {
  expand: string
  startAt: number
  maxResults: number
  total: number
  issues: SearchedJiraIssue[]
}

export interface SearchedJiraIssue {
  expand?: string
  id?: string
  self?: string
  key: string
  fields: {
    summary?: string
  }
}

interface JiraFields {
  summary?: string
  issuetype?: {
    id: string
  }
  project?: {
    id: string
  }
  fixVersions?: {
    id: string
  }[]
}

interface JiraIssueUpdate {
  fixVersions?: [
    {
      add: {id?: string}
    }
  ]
}

export interface JiraIssue {
  update: JiraIssueUpdate
  fields?: JiraFields
}

export interface JiraVersion {
  self?: string
  id?: string
  name: string
  archived: boolean
  released: boolean
  startDate?: string
  releaseDate?: string
  userStartDate?: string
  userReleaseDate?: string
  projectId?: number
  description?: string
  overdue?: boolean
}

const getAuthHeaders = (email: string, token: string): AuthHeaders => {
  return {
    headers: {
      Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString(
        'base64'
      )}`,
      Accept: 'application/json'
    }
  }
}

export const searchIssues = async (
  context: JiraContext,
  jQLQuery: string,
  properties: string[]
): Promise<SearchedJiraIssue[]> => {
  const {subDomain, email, token} = context
  try {
    core.info('request searchIssues')
    const response = await axios.post(
      `https://${subDomain}.atlassian.net/rest/api/3/search`,
      {
        jql: jQLQuery,
        maxResults: 15,
        fieldsByKeys: true,
        fields: properties,
        startAt: 0
      },
      getAuthHeaders(email, token)
    )
    core.info(`searchIssues successful`)
    let issues: SearchedJiraIssue[] = []
    if (response?.data?.issues && response?.data?.issues.length > 0) {
      issues = response.data.issues
    }
    return issues
  } catch (error: unknown | AxiosError) {
    core.error('error during searchIssues request')
    if (axios.isAxiosError(error)) {
      core.error(error.message)
      core.error(JSON.stringify(error.toJSON))
    }
    return Promise.reject(error)
  }
}

export const listProjectVersions = async (
  context: JiraContext,
  projectKey: string
): Promise<JiraVersion[]> => {
  const {subDomain, email, token} = context
  try {
    core.info(`request listProjectVersions ${projectKey}`)
    const response = await axios.get(
      `https://${subDomain}.atlassian.net/rest/api/3/project/${projectKey}/versions`,
      getAuthHeaders(email, token)
    )
    core.info(`listProjectVersions successful`)
    return response?.data
  } catch (error: unknown | AxiosError) {
    core.error('error during listProjectVersions request')
    if (axios.isAxiosError(error)) {
      core.error(error.message)
      core.error(JSON.stringify(error.toJSON))
    }
    return Promise.reject(error)
  }
}

export const updateIssue = async (
  context: JiraContext,
  issueKey: string,
  data: JiraIssue
): Promise<void> => {
  const {subDomain, email, token} = context
  try {
    core.info(`request updateIssue ${issueKey}`)
    await axios.put(
      `https://${subDomain}.atlassian.net/rest/api/3/issue/${issueKey}`,
      data,
      getAuthHeaders(email, token)
    )
    core.info(`updateIssue ${issueKey} successful`)
  } catch (error: unknown | AxiosError) {
    core.error('error during updateIssue request')
    if (axios.isAxiosError(error)) {
      core.error(error.message)
      core.error(JSON.stringify(error.toJSON))
    }
    return Promise.reject(error)
  }
}
