import * as github from '@actions/github'
import {Context} from '@actions/github/lib/context'
type GitHub = ReturnType<typeof github.getOctokit>

export interface GitHubContext {
  octokit: GitHub
  context: Context
  workspace: string
}

export interface GitHubUser {
  name?: string | null | undefined
  email?: string | null | undefined
  gravatar_id: string | null
  starred_at?: string | undefined
  login: string
  id: number
  node_id: string
  avatar_url: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}

export interface GitHubCommitRef {
  sha: string
  node_id: string
  html_url: string
  comments_url: string
  commit: {
    url: string
    author: {
      name?: string | undefined
      email?: string | undefined
      date?: string | undefined
    } | null
    committer: {
      name?: string | undefined
      email?: string | undefined
      date?: string | undefined
    } | null
    message: string
    tree: {}
    comment_count: number
    verification?: {}
  }
  author: GitHubUser | null
  committer: GitHubUser | null
  parents?: {}[]
  files?: {}[]
}

export const getRevisionFromOldestCommit = async (
  actionContext: GitHubContext,
  prId: number
): Promise<GitHubCommitRef | null> => {
  const {octokit, context} = actionContext
  const response = await octokit.pulls.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: prId
  })
  const commits = response.data
  if (commits.length < 1) {
    return null
  }
  return commits[0]
}
