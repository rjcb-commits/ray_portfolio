import fs from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { marked } from 'marked'

const PAGE_TITLE = 'NBA Player Archetypes'
const PAGE_DESC =
  'K-means clustering on per-100-possession stats finds eight player archetypes in the 2024-25 NBA season, none of which line up with the traditional five-position framework.'
const PAGE_URL = 'https://rayzjack.com/apps/nba-archetypes'

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | Raymond Jack`,
  description: PAGE_DESC,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    type: 'article',
    url: PAGE_URL,
    siteName: 'Raymond Jack',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESC,
  },
}

export default async function NbaArchetypesPage() {
  const file = path.join(process.cwd(), 'app/apps/nba-archetypes/content.md')
  const md = await fs.readFile(file, 'utf-8')
  const html = await marked.parse(md, { gfm: true, breaks: false })

  return (
    <main className="appPage">
      <div className="wrap appPageHeader">
        <a href="/" className="backLink">← Back</a>
        <a
          href="https://github.com/rjcb-commits/nba_archetypes"
          target="_blank"
          rel="noreferrer"
          className="repoLink"
        >
          View on GitHub
        </a>
      </div>
      <article className="wrap prose" dangerouslySetInnerHTML={{ __html: html }} />
      <footer className="footer wrap">
        <div>© {new Date().getFullYear()} Raymond Jack</div>
        <div className="footerMeta">Built with Next.js</div>
      </footer>
    </main>
  )
}
