import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "How do I purchase a product?",
      answer: "Create an account, find the product you want, and click 'Buy Now'. You'll receive a Pi wallet address. Send the exact amount in Pi (π), submit your transaction ID, and once verified by admin, your download will be available instantly."
    },
    {
      question: "What cryptocurrencies do you accept?",
      answer: "We exclusively accept Pi (π) — the native cryptocurrency of the Pi Network. Payments are made directly inside Pi Browser using the Pi SDK, ensuring fast, secure, and native transactions on the Pi blockchain."
    },
    {
      question: "How long does it take to receive my download?",
      answer: "Delivery is nearly instant once your transaction achieves the required network confirmations (usually 1-3 minutes depending on the network)."
    },
    {
      question: "What if the product doesn't work as described?",
      answer: "All our products are rigorously tested before listing. However, if you encounter critical bugs or the product materially differs from its description, you can open a support ticket within 14 days for assistance or a potential refund."
    },
    {
      question: "Can I sell my own products on CryptoMarket?",
      answer: "Yes, you can apply to become a vendor. Head to your profile settings to submit a vendor application. We review all applicants to maintain our quality standards."
    },
    {
      question: "Are updates included?",
      answer: "Yes, standard licenses include 6 months of updates and support from the author. Pro and Enterprise licenses include extended periods."
    }
  ];

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground">Everything you need to know about CryptoMarket.</p>
      </div>

      <div className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-lg font-medium hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
