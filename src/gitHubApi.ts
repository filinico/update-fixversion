import * as github from '@actions/github'
import {Context} from '@actions/github/lib/context'
type GitHub = ReturnType<typeof github.getOctokit>

export interface GitHubContext {
  octokit: GitHub
  context: Context
  workspace: string
}

export const getRevisionFromOldestCommit = async (
  actionContext: GitHubContext,
  prId: number
): Promise<string> => {
  const {octokit, context} = actionContext
  const response = await octokit.pulls.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: prId
  })
  const commits = response.data
  if (commits.length < 1) {
    throw new Error(`No commits found from PR#${prId}`)
  }
  return commits[0].sha
}
