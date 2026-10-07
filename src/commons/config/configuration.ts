/* eslint-disable */
import { readFileSync, existsSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import * as _ from 'lodash';

const YAML_CONFIG_FILENAME = 'config/config.yml';
const filePath = join(__dirname, '../../../', YAML_CONFIG_FILENAME);
const envfilePath = join(
  __dirname,
  '../../../',
  `config/config.${process.env.NODE_ENV || 'development'}.yml`,
);

/**
 * 安全加载YAML配置文件
 * @param configPath 配置文件路径
 * @param isRequired 是否为必需文件
 * @returns 解析后的配置对象，如果文件不存在且非必需则返回空对象
 */
function loadConfigSafely(configPath: string, isRequired: boolean = true): any {
  if (!existsSync(configPath)) {
    if (isRequired) {
      throw new Error(`必需的配置文件不存在: ${configPath}`);
    }
    console.warn(`可选配置文件不存在，跳过加载: ${configPath}`);
    return {};
  }

  try {
    return yaml.load(readFileSync(configPath, 'utf8'));
  } catch (error) {
    throw new Error(`配置文件解析失败: ${configPath}, 错误: ${error.message}`);
  }
}

// 加载基础配置（必需）
const commonConfig = loadConfigSafely(filePath, true);

// 加载环境配置（可选，如果不存在则使用空对象）
const envConfig = loadConfigSafely(envfilePath, false);

// 合并配置
const configuration = _.merge(commonConfig, envConfig);

process.env.DATABASE_URL = configuration.database.url;

export default () => configuration;
