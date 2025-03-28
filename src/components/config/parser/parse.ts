/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
 *                                                                                *
 * Permission is hereby granted, free of charge, to any person obtaining a copy   *
 * of this software and associated documentation files (the "Software"), to deal  *
 * in the Software without restriction, including without limitation the rights   *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      *
 * copies of the Software, and to permit persons to whom the Software is          *
 * furnished to do so, subject to the following conditions:                       *
 *                                                                                *
 * The above copyright notice and this permission notice shall be included in all *
 * copies or substantial portions of the Software.                                *
 *                                                                                *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  *
 * SOFTWARE.                                                                      *
 **********************************************************************************/

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import isUrl from 'is-url'
import yml from 'js-yaml'

import type { Config } from '../../../interfaces/config.js'
import { sendHttpRequest } from '../../../utils/http.js'
import { parseHarFile } from './har.js'
import { parseInsomnia } from './insomnia.js'
import { parseConfigFromPostman } from './postman.js'
import { parseConfigFromSitemap } from './sitemap.js'
import { parseConfigFromText } from './text.js'

export type ConfigType =
  | 'har'
  | 'insomnia'
  | 'monika'
  | 'postman'
  | 'sitemap'
  | 'text'

export async function parseByType(
  source: string,
  type: ConfigType
): Promise<Config> {
  const config = isUrl(source)
    ? await getConfigFileFromUrl(source)
    : await readFile(source, { encoding: 'utf8' })
  const isEmpty = config.length === 0

  if (isEmpty) {
    throw new Error(`Failed to read ${source}, the file is empty.`)
  }

  const extension = path.extname(source)

  if (type === 'har') return parseHarFile(config)
  if (type === 'text') return parseConfigFromText(config)
  if (type === 'postman') return parseConfigFromPostman(config)
  if (type === 'sitemap') return parseConfigFromSitemap(config)
  if (type === 'insomnia')
    return parseInsomnia(config, extension.replace('.', ''))

  return parseConfigByExt({
    config,
    extension,
  })
}

async function getConfigFileFromUrl(url: string) {
  const config = await fetchConfigFile(url)
  const isEmpty = config.length === 0

  if (isEmpty) {
    throw new Error(
      `The remote file ${url} is empty. Please check the URL or your connection again.`
    )
  }

  return config
}

async function fetchConfigFile(url: string) {
  try {
    const resp = await sendHttpRequest({ url })
    if (!resp.ok) {
      throw new Error(`The configuration file in ${url} is unreachable.`)
    }

    return await resp.text()
  } catch {
    throw new Error(`The configuration file in ${url} is unreachable.`)
  }
}

type ParseConfigByExtParams = {
  config: string
  extension: string
}

function parseConfigByExt({ config, extension }: ParseConfigByExtParams) {
  const isYaml = ['.yaml', '.yml'].includes(extension)

  if (isYaml) {
    return yml.load(config, { json: true }) as Config
  }

  return JSON.parse(config)
}
