import * as core from '@actions/core'
import {exec} from 'promisify-child-process'

export const extractJiraIssues = async (
  oldestCommitRevision: string,
  headRevision: string,
  githubWorkspace: string,
  projectsKeys: string
): Promise<string[]> => {
  await exec(`chmod +x ${__dirname}/extract-issues`)
  await exec(`cd ${githubWorkspace}`)
  const {stdout, stderr} = await exec(
    `${__dirname}/extract-issues -o ${oldestCommitRevision} -h ${headRevision} -p ${projectsKeys}`
  )
  core.info(`issueKeysCommaSeparated:--${stdout}--`)
  if (stderr) {
    core.error(stderr.toString())
  }
  const issueKeysCommaSeparated = stdout as string | null
  return convertScriptResults(issueKeysCommaSeparated)
}

export const convertScriptResults = (
  issueKeysCommaSeparated: string | null
): string[] => {
  let issueKeys: string[] = []
  if (issueKeysCommaSeparated && issueKeysCommaSeparated.includes(',')) {
    const searchRegExp = /\s/g
    const resultsFormatted = issueKeysCommaSeparated.replace(searchRegExp, '')
    if (resultsFormatted !== '') {
      issueKeys = resultsFormatted.split(',')
    }
  }
  return issueKeys
}
