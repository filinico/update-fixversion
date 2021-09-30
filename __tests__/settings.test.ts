import {getFixVersionFromVersionSetting} from '../src/versionSetting'

test('get fix version from settings', async () => {
  const fixVersion = getFixVersionFromVersionSetting(
    'version101.txt',
    'test',
    '2.',
    './__tests__/testData'
  )
  expect(fixVersion).toEqual('test10.1.0')
  const fixVersion2 = getFixVersionFromVersionSetting(
    'version210.txt',
    'test',
    '3.',
    './__tests__/testData'
  )
  expect(fixVersion2).toEqual('test21.0.0')
})
