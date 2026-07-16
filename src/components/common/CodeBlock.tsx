import { Highlight, themes, type Language } from 'prism-react-renderer'
import { cn } from '@/lib/utils'

const extensionToLanguage: Record<string, Language> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  mjs: 'javascript',
  cjs: 'javascript',
  json: 'json',
  css: 'css',
  scss: 'scss',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  py: 'python',
  java: 'java',
  go: 'go',
  rs: 'rust',
  rb: 'ruby',
  php: 'php',
  sh: 'bash',
  bash: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
  sql: 'sql',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  kt: 'kotlin',
  swift: 'swift',
  graphql: 'graphql',
  diff: 'diff',
}

function guessLanguage(fileName?: string): Language {
  const ext = fileName?.split('.').pop()?.toLowerCase()
  return (ext && extensionToLanguage[ext]) || 'tsx'
}

interface CodeBlockProps {
  code: string
  fileName?: string
  className?: string
}

export function CodeBlock({ code, fileName, className }: CodeBlockProps) {
  const language = guessLanguage(fileName)

  return (
    <Highlight code={code} language={language} theme={themes.dracula}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={cn('max-h-64 overflow-auto rounded-md p-2 text-xs', className)}
          style={style}
        >
          {tokens.map((line, lineIndex) => {
            const { key: lineKey, ...lineProps } = getLineProps({ line, key: lineIndex })
            return (
              <div key={lineKey as string} {...lineProps}>
                {line.map((token, tokenIndex) => {
                  const { key: tokenKey, ...tokenProps } = getTokenProps({ token, key: tokenIndex })
                  return <span key={tokenKey as string} {...tokenProps} />
                })}
              </div>
            )
          })}
        </pre>
      )}
    </Highlight>
  )
}
