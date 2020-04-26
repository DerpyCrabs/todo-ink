import { appendFileSync } from 'fs'

export default function useDebug(path: string) {
  return (data: any) => {
    appendFileSync(`debug-${path}.json`, JSON.stringify(data) + '\n')
  }
}
