/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

'use strict';

import type {GlobalConfig, ProjectConfig} from 'types/Config';

const path = require('path');
const loadFromFile = require('./loadFromFile');
const loadFromPackage = require('./loadFromPackage');
const normalize = require('./normalize');
const setFromArgv = require('./setFromArgv');
const {getTestEnvironment} = require('./utils');

async function readConfig(
  argv: Object,
  packageRoot: string,
): Promise<{
  config: ProjectConfig,
  globalConfig: GlobalConfig,
  hasDeprecationWarnings: boolean,
}> {
  const rawConfig = await readRawConfig(argv, packageRoot);
  const {options, hasDeprecationWarnings} = normalize(rawConfig, argv);
  const {globalConfig, projectConfig} = getConfigs(setFromArgv(options, argv));
  return {
    config: projectConfig,
    globalConfig,
    hasDeprecationWarnings,
  };
}

const parseConfig = argv => {
  if (argv.config && typeof argv.config === 'string') {
    // If the passed in value looks like JSON, treat it as an object.
    if (argv.config[0] === '{' && argv.config[argv.config.length - 1] === '}') {
      return JSON.parse(argv.config);
    }
  }
  return argv.config;
};

const readRawConfig = (argv, root) => {
  const rawConfig = parseConfig(argv);

  if (typeof rawConfig === 'string') {
    return loadFromFile(path.resolve(process.cwd(), rawConfig));
  }

  if (typeof rawConfig === 'object') {
    const config = Object.assign({}, rawConfig);
    config.rootDir = config.rootDir || root;
    return Promise.resolve(config);
  }

  return loadFromPackage(root).then(config => config || {rootDir: root});
};

const getConfigs = (
  options,
): {globalConfig: GlobalConfig, projectConfig: ProjectConfig} => {
  return {
    globalConfig: Object.freeze({
      bail: options.bail,
      collectCoverage: options.collectCoverage,
      collectCoverageFrom: options.collectCoverageFrom,
      collectCoverageOnlyFrom: options.collectCoverageOnlyFrom,
      coverageDirectory: options.coverageDirectory,
      coveragePathIgnorePatterns: options.coveragePathIgnorePatterns,
      coverageReporters: options.coverageReporters,
      coverageThreshold: options.coverageThreshold,
      expand: options.expand,
      forceExit: options.forceExit,
      logHeapUsage: options.logHeapUsage,
      logTransformErrors: options.logTransformErrors,
      mapCoverage: options.mapCoverage,
      noStackTrace: options.noStackTrace,
      notify: options.notify,
      replname: options.replname,
      rootDir: options.rootDir,
      silent: options.silent,
      testNamePattern: options.testNamePattern,
      testResultsProcessor: options.testResultsProcessor,
      updateSnapshot: options.updateSnapshot,
      useStderr: options.useStderr,
      verbose: options.verbose,
      watch: options.watch,
      watchman: options.watchman,
    }),
    projectConfig: options,
  };
};

module.exports = {
  getTestEnvironment,
  normalize,
  readConfig,
};
