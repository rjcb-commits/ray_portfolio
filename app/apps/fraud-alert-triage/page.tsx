import fs from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { marked } from 'marked'
import ScaledTableauEmbed from './ScaledTableauEmbed'

const PAGE_TITLE = 'Fraud Alert Triage: Ranking, Reviewers & Guardrailed AI'
const PAGE_DESC =
  '30,622 bank account-opening fraud alerts: risk-ranking turns a 12% hit rate into 74%, 50 reviewers range from 33% to 96% accuracy, and a local AI assistant drafts investigator notes behind code-enforced guardrails.'
const PAGE_URL = 'https://rayzjack.com/apps/fraud-alert-triage'
const PAGE_IMAGE = '/dash_icon.png'

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

const TABLEAU_EMBED_URL: string | null =
  'https://public.tableau.com/views/FraudAlertTriage/1-Queue?:embed=y&:display_count=no&:showVizHome=no&:toolbar=no&:tabs=no'

export default async function FraudAlertTriagePage() {
  const file = path.join(process.cwd(), 'app/apps/fraud-alert-triage/content.md')
  const md = await fs.readFile(file, 'utf-8')
  const html = await marked.parse(md, { gfm: true, breaks: false })

  return (
    <main className="appPage">
      <div className="wrap appPageHeader">
        <a href="/" className="backLink">← Back</a>
        <a
          href="https://github.com/rjcb-commits/fraud_alert_triage"
          target="_blank"
          rel="noreferrer"
          className="repoLink"
        >
          View on GitHub
        </a>
      </div>

      {TABLEAU_EMBED_URL ? (
        <div className="wrap" style={{ marginBottom: 24 }}>
          <ScaledTableauEmbed
            src={TABLEAU_EMBED_URL}
            title="Fraud Alert Triage dashboard"
            width={1366}
            height={795}
          />
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
