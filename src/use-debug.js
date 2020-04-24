import React from 'react'
import { appendFileSync } from 'fs'

export default function useDebug(path) {
  return (data) => {
    appendFileSync(`debug-${path}.json`, JSON.stringify(data) + '\n')
  }
}
