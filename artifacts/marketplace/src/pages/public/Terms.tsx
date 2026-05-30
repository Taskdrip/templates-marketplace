import { Link } from "wouter";
import { Shield, ArrowLeft } from "lucide-react";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold mb-4 text-foreground">{title}</h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

const TOC = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "description", label: "Platform Description" },
  { id: "accounts", label: "Accounts & Registration" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "payments", label: "Payments & Escrow" },
  { id: "sellers", label: "Seller Obligations" },
  { id: "buyers", label: "Buyer Obligations" },
  { id: "refunds", label: "Refund Policy" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "disclaimer", label: "Disclaimers & Liability" },
  { id: "dmca", label: "DMCA Policy" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact-legal", label: "Contact" },
];

export default function Terms() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vaultrade.store
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
              <p className="text-sm text-muted-foreground">Last updated: January 1, 2025 · Effective immediately</p>
            </div>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
            Please read these Terms of Service carefully before using <strong className="text-foreground">Vaultrade.store</strong>. By accessing or using our platform, you agree to be bound by these terms. If you do not agree, please do not use our services.
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* TOC sidebar */}
          <aside className="lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contents</p>
              <nav className="space-y-1">
                {TOC.map(item => (
                  <a key={item.id} href={`#${item.id}`} className="block text-sm text-muted-foreground hover:text-primary transition-colors py-0.5 hover:translate-x-0.5">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Body */}
          <div className="flex-1 space-y-12 text-sm">
            <Section id="acceptance" title="1. Acceptance of Terms">
              <p>By creating an account, making a purchase, listing a product, or otherwise accessing Vaultrade.store (the "Platform"), you agree to these Terms of Service ("Terms") and our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which is incorporated by reference.</p>
              <p>These Terms constitute a legally binding agreement between you and Vaultrade.store Ltd. ("Vaultrade", "we", "us", or "our"). If you are using the Platform on behalf of an organization, you represent that you have authority to bind that organization.</p>
              <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email or a prominent notice on the Platform. Your continued use after such changes constitutes acceptance.</p>
            </Section>

            <Section id="description" title="2. Platform Description">
              <p>Vaultrade.store is a peer-to-peer digital asset marketplace that enables sellers to list and sell digital products, and buyers to purchase them using USDT (Tether) cryptocurrency. Categories include but are not limited to: source code, trading bots, DeFi tools, social media accounts, website templates, landing pages, SaaS applications, and websites.</p>
              <p>Vaultrade acts as an intermediary and escrow agent for transactions. We do not own, create, or warrant any of the products listed by third-party sellers. We are a technology platform, not a party to the underlying sale contracts between buyers and sellers.</p>
            </Section>

            <Section id="accounts" title="3. Accounts & Registration">
              <p>To access most features, you must register for an account. You agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your login credentials.</p>
              <p>You must be at least 18 years old (or the age of majority in your jurisdiction, whichever is higher) to use Vaultrade.store. By creating an account, you represent that you meet this requirement.</p>
              <p>You may not create more than one account per person without prior written approval. Accounts are non-transferable. We reserve the right to terminate accounts that violate these Terms.</p>
            </Section>

            <Section id="acceptable-use" title="4. Acceptable Use">
              <p>You agree not to use the Platform to:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-3">
                <li>List, sell, or distribute malware, spyware, or any harmful code</li>
                <li>Sell stolen accounts, credentials, or data obtained without authorization</li>
                <li>Engage in money laundering, terrorist financing, or sanctions evasion</li>
                <li>Impersonate any person or entity, or falsely represent your identity</li>
                <li>Attempt to bypass escrow, conduct off-platform transactions to evade fees</li>
                <li>Spam, phish, or otherwise harass other users or our staff</li>
                <li>Upload content that infringes on third-party intellectual property rights</li>
                <li>Use automated scrapers or bots without our express written permission</li>
                <li>Attempt to reverse-engineer, hack, or disrupt our infrastructure</li>
                <li>Resell or sublicense products in violation of the original seller's license</li>
              </ul>
              <p>Violation of these prohibitions may result in immediate account termination and, where applicable, referral to law enforcement.</p>
            </Section>

            <Section id="payments" title="5. Payments & Escrow">
              <p>All transactions on Vaultrade.store are conducted in USDT (Tether) via the TRON (TRC20), BNB Smart Chain (BEP20), or TON Network. We do not accept fiat currency payments.</p>
              <p><strong className="text-foreground">Escrow Process:</strong> When a buyer submits payment, funds are held in escrow pending admin verification. Once we confirm the transaction on-chain, the order status is updated and the digital asset is released to the buyer. The seller's payout is processed according to our payout schedule.</p>
              <p><strong className="text-foreground">Transaction Finality:</strong> Cryptocurrency transactions are irreversible. Once a payment is confirmed on-chain, it cannot be reversed. Ensure you are sending to the correct address and amount before broadcasting a transaction.</p>
              <p><strong className="text-foreground">Platform Fee:</strong> Vaultrade charges a platform fee on each successful transaction. The current fee schedule is displayed on our <Link href="/pricing" className="text-primary hover:underline">Pricing page</Link>. Fees are subject to change with 14 days' notice to sellers.</p>
            </Section>

            <Section id="sellers" title="6. Seller Obligations">
              <p>By listing products on Vaultrade.store, sellers agree to:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-3">
                <li>Provide accurate, complete descriptions and preview materials for all listings</li>
                <li>Ensure they own or have full rights to sell the listed digital assets</li>
                <li>Respond to buyer support requests within 48 hours</li>
                <li>Not list products that violate applicable laws or these Terms</li>
                <li>Maintain product quality consistent with the listing description</li>
                <li>Not artificially inflate reviews or manipulate ratings</li>
                <li>Accept that Vaultrade may remove listings that violate our quality standards</li>
              </ul>
              <p>Sellers are solely responsible for the accuracy of their listings and for the products they deliver. Vaultrade is not liable for seller misrepresentation.</p>
            </Section>

            <Section id="buyers" title="7. Buyer Obligations">
              <p>Buyers agree to:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-3">
                <li>Use purchased digital assets only as permitted by the seller's license</li>
                <li>Not share, redistribute, or resell digital assets without explicit permission</li>
                <li>Not file false dispute claims or attempt to receive double delivery</li>
                <li>Provide accurate transaction hashes when submitting payment proof</li>
                <li>Contact seller or support before initiating a dispute</li>
              </ul>
            </Section>

            <Section id="refunds" title="8. Refund Policy">
              <p><strong className="text-foreground">General Policy:</strong> Due to the digital nature of products sold on Vaultrade.store, all sales are generally final once a product is delivered. Refunds are granted only in specific circumstances.</p>
              <p><strong className="text-foreground">Eligible Refund Cases:</strong></p>
              <ul className="list-disc list-inside space-y-1.5 ml-3">
                <li>Product is significantly different from its description</li>
                <li>Product contains malware or harmful code verified by our team</li>
                <li>Payment was submitted but product was never delivered (after 5 business days)</li>
                <li>Technical defects that render the product completely non-functional</li>
              </ul>
              <p><strong className="text-foreground">Non-Eligible Cases:</strong> Buyer's remorse, change of mind, inability to use the product due to lack of technical skill, or disputes raised more than 14 days after delivery.</p>
              <p>To request a refund, open a support ticket with your order ID and evidence. Our team will review within 3 business days.</p>
            </Section>

            <Section id="intellectual-property" title="9. Intellectual Property">
              <p>All content on Vaultrade.store — including our logo, brand identity, platform design, and documentation — is owned by Vaultrade and protected by copyright and trademark law.</p>
              <p>Sellers retain ownership of their digital assets. By listing on Vaultrade, sellers grant us a non-exclusive license to display their products for marketing purposes.</p>
              <p>Buyers receive a non-exclusive, non-transferable license to use purchased digital assets per the terms specified in each listing. Unless explicitly stated, you may not resell or sublicense purchased items.</p>
            </Section>

            <Section id="disclaimer" title="10. Disclaimers & Liability">
              <p>THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. VAULTRADE DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.</p>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, VAULTRADE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR CRYPTOCURRENCY, ARISING FROM YOUR USE OF THE PLATFORM.</p>
              <p>Our total aggregate liability to you shall not exceed the greater of (a) the amount you paid to us in the 3 months preceding the claim, or (b) $100 USD.</p>
            </Section>

            <Section id="dmca" title="11. DMCA Policy">
              <p>We respect intellectual property rights and respond to valid DMCA takedown notices. If you believe content on Vaultrade.store infringes your copyright, send a written notice to our DMCA agent at <strong className="text-foreground">dmca@vaultrade.store</strong> including:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-3">
                <li>A description of the copyrighted work claimed to be infringed</li>
                <li>A description of the infringing material and its location on our Platform</li>
                <li>Your contact information (name, address, email, phone)</li>
                <li>A statement of good faith belief that the use is not authorized</li>
                <li>A statement that the notice is accurate under penalty of perjury</li>
                <li>Your physical or electronic signature</li>
              </ul>
              <p>We will respond to valid notices within 5 business days.</p>
            </Section>

            <Section id="termination" title="12. Termination">
              <p>We may suspend or terminate your access to Vaultrade.store at our sole discretion, with or without notice, for any violation of these Terms or for any conduct we deem harmful to the Platform or other users.</p>
              <p>You may terminate your account at any time by contacting us at <strong className="text-foreground">support@vaultrade.store</strong>. Termination does not affect any outstanding transaction obligations.</p>
            </Section>

            <Section id="governing-law" title="13. Governing Law">
              <p>These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of Vaultrade.store shall be resolved through binding arbitration, except where prohibited by law.</p>
              <p>Nothing in these Terms prevents either party from seeking emergency injunctive relief in a court of competent jurisdiction.</p>
            </Section>

            <Section id="contact-legal" title="14. Contact">
              <p>For questions about these Terms, contact us at:</p>
              <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-1">
                <p><strong className="text-foreground">Vaultrade.store Legal Team</strong></p>
                <p>Email: <a href="mailto:legal@vaultrade.store" className="text-primary hover:underline">legal@vaultrade.store</a></p>
                <p>Support: <Link href="/contact" className="text-primary hover:underline">vaultrade.store/contact</Link></p>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
