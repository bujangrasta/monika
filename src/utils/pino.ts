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

import fs from 'fs'
import { pino, transport } from 'pino'
import { getContext } from '../context/index.js'
import { fileURLToPath } from 'node:url'

export const log = pino(getOptions())

function getOptions() {
  if (getContext().isTest) {
    return {
      base: undefined,
      level: 'error',
      timestamp: false,
    }
  }

  const prettyPrint = {
    translateTime: true,
    ignore: 'hostname,pid,time',
    hideObject: true,
  }

  const project = fileURLToPath(new URL('../../tsconfig.json', import.meta.url))
  const dev = fs.existsSync(project)

  return transport({
    target: 'pino-pretty',
    options: dev
      ? {
          ...prettyPrint,
          level: 'debug',
          colorize: true,
        }
      : prettyPrint,
  })
}
