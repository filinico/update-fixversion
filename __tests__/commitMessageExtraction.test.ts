import {
  extractIssuesFromCommitMessage,
  getPRIdFromCommit
} from '../src/commitMessageExtraction'

const projectsKeys = ['TT', 'XX']

test('Get PR id from commit message', () => {
  expect(
    getPRIdFromCommit(
      'Merge pull request #345 from test/Sync-19.1-with-19.2-392b'
    )
  ).toBe('345')
})

test('Extract issues from commit message', () => {
  expect(
    extractIssuesFromCommitMessage(
      'TT-40432 fix validation of null vat',
      projectsKeys
    )
  ).toStrictEqual(['TT-40432'])
  expect(
    extractIssuesFromCommitMessage(
      'XX-12345 fix validation of null vat',
      projectsKeys
    )
  ).toStrictEqual(['XX-12345'])
  expect(
    extractIssuesFromCommitMessage(
      'XX-12345 TT-54321 fix validation of null vat',
      projectsKeys
    )
  ).toStrictEqual(['XX-12345', 'TT-54321'])
  expect(
    extractIssuesFromCommitMessage(
      'TT-12345 XX-99821 fix validation of null vat',
      projectsKeys
    )
  ).toStrictEqual(['TT-12345', 'XX-99821'])
  expect(
    extractIssuesFromCommitMessage(
      'Merge pull request #345 from feature/XX-12345-my-feature',
      projectsKeys
    )
  ).toStrictEqual(['XX-12345'])
})

test('Wrong commit message', () => {
  expect(getPRIdFromCommit('TT-40432 fix validation of null vat')).toBe(null)
  expect(
    extractIssuesFromCommitMessage(
      'Merge pull request #345 from test/Sync-19.1-with-19.2-392b',
      projectsKeys
    )
  ).toStrictEqual([])
  expect(
    extractIssuesFromCommitMessage('fix validation of null vat', projectsKeys)
  ).toStrictEqual([])
})
