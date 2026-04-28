import fs from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { marked } from 'marked'

const PAGE_TITLE = 'Loan Default Predictor'
const PAGE_DESC =
  'LightGBM model predicting Lending Club loan defaults (AUC 0.71), served as a live Streamlit demo.'
const PAGE_URL = 'https://rayzjack.com/apps/loan-default'
const PAGE_IMAGE = '/apps/loan-default/hero.png'

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | Raymond Jack`,
  description: PAGE_DESC,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    type: 'article',
    url: PAGE_URL,
    siteName: 'Raymond Jack',
    images: [{ url: PAGE_IMAGE, alt: `${PAGE_TITLE} screenshot` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: [PAGE_IMAGE],
  },
}

export default async function LoanDefaultPage() {
  const file = path.join(process.cwd(), 'app/apps/loan-default/content.md')
  const md = await fs.readFile(file, 'utf-8')
  const html = await marked.parse(md, { gfm: true, breaks: false })

  return (
    <main className="appPage">
      <div className="wrap appPageHeader">
        <a href="/" className="backLink">← Back</a>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a
            href="https://loandefaultpredictor-rayjackcb.streamlit.app"
            target="_blank"
            rel="noreferrer"
            className="repoLink"
          >
            Live demo
          </a>
          <a
            href="https://github.com/rjcb-commits/loan_default_predictor"
            target="_blank"
            rel="noreferrer"
            className="repoLink"
          >
            View on GitHub
          </a>
        </div>
      </div>
      <a
        href="https://loandefaultpredictor-rayjackcb.streamlit.app"
        target="_blank"
        rel="noreferrer"
        className="wrap heroShot"
      >
        <img
          src="/apps/loan-default/hero.png"
          alt="Loan Default Predictor live demo screenshot — risk gauge, loan economics, feature contributions"
        />
      </a>
      <article className="wrap prose" dangerouslySetInnerHTML={{ __html: html }} />
      <footer className="footer wrap">
        <div>© {new Date().getFullYear()} Raymond Jack</div>
        <div className="footerMeta">Built with Next.js</div>
      </footer>
    </main>
  )
}
