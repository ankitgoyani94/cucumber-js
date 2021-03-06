import { promisify } from 'bluebird'
import ConfigurationBuilder from './configuration_builder'
import fsExtra from 'fs-extra'
import path from 'path'
import tmp from 'tmp'

const outputFile = promisify(fsExtra.outputFile)

describe('Configuration', function() {
  beforeEach(async function() {
    this.tmpDir = await promisify(tmp.dir)({ unsafeCleanup: true })
    await promisify(fsExtra.mkdirp)(path.join(this.tmpDir, 'features'))
    this.argv = ['path/to/node', 'path/to/cucumber.js']
    this.configurationOptions = {
      argv: this.argv,
      cwd: this.tmpDir
    }
  })

  describe('no argv', function() {
    beforeEach(async function() {
      this.result = await ConfigurationBuilder.build(this.configurationOptions)
    })

    it('returns the default configuration', function() {
      expect(this.result).to.eql({
        featurePaths: [],
        formatOptions: {
          colorsEnabled: true,
          cwd: this.tmpDir
        },
        formats: [{ outputTo: '', type: 'progress' }],
        listI18nKeywordsFor: '',
        listI18nLanguages: false,
        profiles: [],
        runtimeOptions: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          strict: true,
          worldParameters: {}
        },
        scenarioFilterOptions: {
          cwd: this.tmpDir,
          featurePaths: ['features'],
          names: [],
          tagExpression: ''
        },
        supportCodePaths: []
      })
    })
  })

  describe('path to a feature', function() {
    beforeEach(async function() {
      this.relativeFeaturePath = path.join('features', 'a.feature')
      this.featurePath = path.join(this.tmpDir, this.relativeFeaturePath)
      await outputFile(this.featurePath, '')
      this.supportCodePath = path.join(this.tmpDir, 'features', 'a.js')
      await outputFile(this.supportCodePath, '')
      this.argv.push(this.relativeFeaturePath)
      this.result = await ConfigurationBuilder.build(this.configurationOptions)
    })

    it('returns the appropriate feature and support code paths', async function() {
      const {
        featurePaths,
        scenarioFilterOptions,
        supportCodePaths
      } = this.result
      expect(featurePaths).to.eql([this.featurePath])
      expect(scenarioFilterOptions.featurePaths).to.eql([
        this.relativeFeaturePath
      ])
      expect(supportCodePaths).to.eql([this.supportCodePath])
    })
  })

  describe('path to a nested feature', function() {
    beforeEach(async function() {
      this.relativeFeaturePath = path.join('features', 'nested', 'a.feature')
      this.featurePath = path.join(this.tmpDir, this.relativeFeaturePath)
      await outputFile(this.featurePath, '')
      this.supportCodePath = path.join(this.tmpDir, 'features', 'a.js')
      await outputFile(this.supportCodePath, '')
      this.argv.push(this.relativeFeaturePath)
      this.result = await ConfigurationBuilder.build(this.configurationOptions)
    })

    it('returns the appropriate feature and support code paths', async function() {
      const {
        featurePaths,
        scenarioFilterOptions,
        supportCodePaths
      } = this.result
      expect(featurePaths).to.eql([this.featurePath])
      expect(scenarioFilterOptions.featurePaths).to.eql([
        this.relativeFeaturePath
      ])
      expect(supportCodePaths).to.eql([this.supportCodePath])
    })
  })
})
