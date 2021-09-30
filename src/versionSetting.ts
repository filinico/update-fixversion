import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'

export const getFixVersionFromVersionSetting = (
  settingFilePath: string,
  tagPrefix: string,
  versionPrefix: string,
  workspace: string
): string => {
  core.info(`settingsPath:${settingFilePath}`)
  const filePath = path.resolve(workspace, settingFilePath)
  const rawData = fs.readFileSync(filePath, 'utf8')
  let fixVersion: string

  if (versionPrefix !== '') {
    const versionWithoutPrefix = `${rawData.replace(versionPrefix, '')}.0`
    const versionNumber = parseFloat(versionWithoutPrefix) / 10
    fixVersion = `${versionNumber.toFixed(1)}.0`
  } else {
    fixVersion = rawData
  }
  if (tagPrefix !== '') {
    fixVersion = `${tagPrefix}${fixVersion}`
  }
  return fixVersion
}
