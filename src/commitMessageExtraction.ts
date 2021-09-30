export const getPRIdFromCommit = (commitMessage: string): string | null => {
  const regex = /#[0-9]+/g
  const matches = commitMessage.match(regex)
  if (matches) {
    return matches[0].replace('#', '')
  }
  return matches
}

export const extractIssuesFromCommitMessage = (
  commitMessage: string,
  projectsKeys: string[]
): string[] => {
  const projects = projectsKeys.join('|')
  const regex = `(${projects})-[0-9]{5,6}`
  const matches = commitMessage.match(new RegExp(regex, 'g'))
  if (!matches) {
    return []
  }
  return matches
}
