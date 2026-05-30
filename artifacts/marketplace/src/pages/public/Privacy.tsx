import { Link } from "wouter";
import { Lock, ArrowLeft } from "lucide-react";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold mb-4 text-foreground">{title}</h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "data-we-collect", label: "Data We Collect" },
  { id: "how-we-use", label: "How We Use Data" },
  { id: "data-sharing", label: "Data Sharing" },
  { id: "crypto-payments", label: "Crypto & Blockchain Data" },
  { id: "cookies", label: "Cookie Policy" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Rights" },
  { id: "security", label: "Security" },
  { id: "children", label: "Children's Privacy" },
  { id: "changes", label: "Policy Changes" },
  { id: "contact-privacy", label: "Contact" },
];

export default function Privacy() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vaultrade.store
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: January 1, 2025 · Vaultrade.store Ltd.</p>
            </div>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
            At <strong className="text-foreground">Vaultrade.store</strong>, your privacy matters. This policy explains what data we collect, why we collect it, and how we protect it. We do not sell your personal data to third parties.
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* TOC sidebar */}
          <aside className="lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contents</p>
              <nav className="space-y-1">
                {TOC.map(item => (
                  <a key={item.id} href={`#${item.id}`} className="block text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Body */}
          <div className="flex-1 space-y-12 text-sm">
            <Section id="overview" title="1. Overview">
              <p>This Privacy Policy applies to all services operated by Vaultrade.store Ltd. ("Vaultrade", "we", "us", or "our"), including our website at vaultrade.store and all related sub-domains and applications.</p>
              <p>We are committed to protecting your personal information in accordance with applicable data protection laws. This policy describes our practices regarding the collection, use, storage, and disclosure of personal information.</p>
            </Section>

            <Section id="data-we-collect" title="2. Data We Collect">
              <p><strong className="text-foreground">Account Information:</strong> When you register, we collect your email address, username, display name, and optionally your phone number and Telegram handle.</p>
              <p><strong className="text-foreground">Transaction Data:</strong> For each order, we collect the order amount, product ID, payment network (TRC20/BEP20/TON), transaction hash (TXID), and any proof screenshots you provide voluntarily.</p>
              <p><strong className="text-foreground">Communication Data:</strong> Messages sent through our in-app chat and support ticket system are stored and retained for dispute resolution purposes.</p>
              <p><strong className="text-foreground">Technical Data:</strong> We automatically collect IP addresses, browser type, device type, operating system, referring URLs, and session timestamps to operate and improve the Platform.</p>
              <p><strong className="text-foreground">Usage Data:</strong> Pages viewed, products browsed, search queries, click patterns, and session duration, collected via server logs and analytics tools.</p>
            </Section>

            <Section id="how-we-use" title="3. How We Use Data">
              <p>We use collected data to:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-3">
                <li>Operate and maintain the Platform and process transactions</li>
                <li>Verify payment transactions and manage escrow</li>
                <li>Communicate with you about orders, support, and account activity</li>
                <li>Send product updates, blog posts, and promotional messages (opt-out available)</li>
                <li>Detect and prevent fraud, abuse, and policy violations</li>
                <li>Analyze usage patterns to improve our Platform</li>
                <li>Comply with legal obligations and law enforcement requests</li>
                <li>Resolve disputes between buyers and sellers</li>
              </ul>
            </Section>

            <Section id="data-sharing" title="4. Data Sharing">
              <p>We do not sell, rent, or trade your personal information. We may share data in limited circumstances:</p>
              <p><strong className="text-foreground">With Sellers:</strong> When you purchase a product, the seller receives your username and order details (not your email or payment wallet address) to fulfill the order.</p>
              <p><strong className="text-foreground">Service Providers:</strong> We use trusted third-party providers for infrastructure (hosting, databases), email delivery, and analytics. These providers are contractually bound to protect your data.</p>
              <p><strong className="text-foreground">Legal Requirements:</strong> We may disclose data when required by law, court order, or government request, or to protect the rights, safety, or property of Vaultrade, our users, or the public.</p>
              <p><strong className="text-foreground">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction. We will notify you before your personal information is transferred.</p>
            </Section>

            <Section id="crypto-payments" title="5. Crypto & Blockchain Data">
              <p>When you submit a payment, you provide us with a transaction hash (TXID) and optionally a proof screenshot. We verify this data on the public blockchain to confirm your payment.</p>
              <p><strong className="text-foreground">Public Blockchain Notice:</strong> Cryptocurrency transactions are publicly recorded on the blockchain. While Vaultrade does not publish your wallet address, your on-chain transactions may be visible to anyone who knows your wallet address. Vaultrade is not responsible for blockchain-level data visibility.</p>
              <p>We store your TXID and payment chain for order verification and dispute resolution. We do not store your private keys or wallet seed phrases — we never ask for these.</p>
            </Section>

            <Section id="cookies" title="6. Cookie Policy">
              <p>We use cookies and similar tracking technologies to enhance your experience on Vaultrade.store.</p>
              <p><strong className="text-foreground">Essential Cookies:</strong> Required for authentication, security, and core platform functionality. These cannot be disabled.</p>
              <p><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how users interact with the Platform. We use privacy-friendly analytics that anonymize IP addresses. You can opt out via your browser settings.</p>
              <p><strong className="text-foreground">Preference Cookies:</strong> Remember your language, theme, and display preferences.</p>
              <p>You can control cookies through your browser settings. Disabling essential cookies may impact Platform functionality.</p>
            </Section>

            <Section id="data-retention" title="7. Data Retention">
              <p>We retain your personal data for as long as necessary to provide our services and comply with legal obligations:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-3">
                <li><strong className="text-foreground">Account Data:</strong> Retained while your account is active, plus 2 years after closure</li>
                <li><strong className="text-foreground">Transaction Records:</strong> Retained for 7 years for financial compliance purposes</li>
                <li><strong className="text-foreground">Support Messages:</strong> Retained for 2 years from last contact</li>
                <li><strong className="text-foreground">Technical Logs:</strong> Automatically deleted after 90 days</li>
                <li><strong className="text-foreground">Analytics Data:</strong> Aggregated and anonymized after 13 months</li>
              </ul>
            </Section>

            <Section id="your-rights" title="8. Your Rights">
              <p>Depending on your location, you may have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-3">
                <li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong className="text-foreground">Deletion:</strong> Request deletion of your data ("right to be forgotten") — subject to legal retention requirements</li>
                <li><strong className="text-foreground">Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong className="text-foreground">Objection:</strong> Object to certain types of processing, including direct marketing</li>
                <li><strong className="text-foreground">Withdrawal:</strong> Withdraw consent for consent-based processing at any time</li>
              </ul>
              <p>To exercise any of these rights, contact us at <a href="mailto:privacy@vaultrade.store" className="text-primary hover:underline">privacy@vaultrade.store</a>. We will respond within 30 days.</p>
            </Section>

            <Section id="security" title="9. Security">
              <p>We implement industry-standard security measures to protect your personal data, including:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-3">
                <li>TLS encryption for all data in transit</li>
                <li>AES-256 encryption for sensitive data at rest</li>
                <li>JWT-based authentication with secure token handling</li>
                <li>Regular penetration testing by external security researchers</li>
                <li>Two-factor authentication available for all accounts</li>
                <li>Role-based access controls limiting employee data access</li>
              </ul>
              <p>Despite our best efforts, no system is 100% secure. If you discover a security vulnerability, please report it responsibly to <a href="mailto:security@vaultrade.store" className="text-primary hover:underline">security@vaultrade.store</a>.</p>
            </Section>

            <Section id="children" title="10. Children's Privacy">
              <p>Vaultrade.store is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately and we will delete it.</p>
            </Section>

            <Section id="changes" title="11. Policy Changes">
              <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email (using the address on your account) or by posting a prominent notice on our website at least 14 days before the changes take effect.</p>
              <p>Your continued use of Vaultrade.store after changes take effect constitutes acceptance of the revised Policy.</p>
            </Section>

            <Section id="contact-privacy" title="12. Contact">
              <p>For privacy-related questions, data requests, or concerns, contact our Privacy Team:</p>
              <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-1">
                <p><strong className="text-foreground">Vaultrade.store Privacy Team</strong></p>
                <p>Email: <a href="mailto:privacy@vaultrade.store" className="text-primary hover:underline">privacy@vaultrade.store</a></p>
                <p>General Support: <Link href="/contact" className="text-primary hover:underline">vaultrade.store/contact</Link></p>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
