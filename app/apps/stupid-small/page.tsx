import fs from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { marked } from 'marked'

const PAGE_TITLE = 'Stupid Small'
const PAGE_DESC =
  'AI-powered Android app that breaks scary tasks into stupidly small steps you actually finish.'
const PAGE_URL = 'https://rayzjack.com/apps/stupid-small'
const PAGE_IMAGE = '/stupid-small-icon.png'

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | Raymond Jack`,
  description: PAGE_DESC,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    type: 'article',
    url: PAGE_URL,
    siteName: 'Raymond Jack',
    images: [{ url: PAGE_IMAGE, alt: `${PAGE_TITLE} icon` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: [PAGE_IMAGE],
  },
}

export default async function StupidSmallPage() {
  const file = path.join(process.cwd(), 'app/apps/stupid-small/content.md')
  const md = await fs.readFile(file, 'utf-8')
  const html = await marked.parse(md, { gfm: true, breaks: false })

  return (
    <main className="appPage">
      <div className="wrap appPageHeader">
        <a href="/" className="backLink">← Back</a>
      </div>
      <article className="wrap prose" dangerouslySetInnerHTML={{ __html: html }} />
      <footer className="footer wrap">
        <div>© {new Date().getFullYear()} Raymond Jack</div>
        <div className="footerMeta">Built with Next.js</div>
      </footer>
    </main>
  )
}
