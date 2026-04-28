import fs from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { marked } from 'marked'

export const metadata: Metadata = {
  title: 'CFPB Consumer Complaints Dashboard — Raymond Jack',
  description:
    'Tableau dashboard on the CFPB Consumer Complaint Database, surfacing the products, issues, and companies driving consumer financial complaints from 2012 to present.',
}

const TABLEAU_EMBED_URL: string | null =
  'https://public.tableau.com/views/CFPBP2PResolutionGap/CFPBP2PComplaints?:embed=y&:display_count=no&:showVizHome=no&:toolbar=no&:tabs=no'

export default async function CfpbPage() {
  const file = path.join(process.cwd(), 'app/apps/cfpb-complaints/content.md')
  const md = await fs.readFile(file, 'utf-8')
  const html = await marked.parse(md, { gfm: true, breaks: false })

  return (
    <main className="appPage">
      <div className="wrap appPageHeader">
        <a href="/" className="backLink">← Back</a>
        <a
          href="https://github.com/rjcb-commits/cfpb-complaints-dashboard"
          target="_blank"
          rel="noreferrer"
          className="repoLink"
        >
          View on GitHub
        </a>
      </div>

      {TABLEAU_EMBED_URL ? (
        <div className="wrap" style={{ marginBottom: 24 }}>
          <div
            style={{
              position: 'relative',
              paddingBottom: '72%',
              height: 0,
              overflow: 'hidden',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            <iframe
              src={TABLEAU_EMBED_URL}
              title="CFPB Consumer Complaints Dashboard"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
              allow="fullscreen"
            />
          </div>
        </div>
      ) : null}

      <article className="wrap prose" dangerouslySetInnerHTML={{ __html: html }} />
      <footer className="footer wrap">
        <div>© {new Date().getFullYear()} Raymond Jack</div>
        <div className="footerMeta">Built with Next.js</div>
      </footer>
    </main>
  )
}
