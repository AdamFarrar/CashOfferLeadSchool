"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@cocs/ui";

const FAQS = [
    { q: "Who is this for?", a: "Operators and teams running — or planning to run — a cash offer lead generation and conversion business. If you're buying leads, running a disposition desk, or want to start, this is built for you." },
    { q: "What's the time commitment?", a: "One episode per week plus a live session. Plan for 2–3 hours per week. Everything is recorded if you miss a session." },
    { q: "Is this a course or a coaching program?", a: "Neither. It's an installation system. You install proven conversion systems into your operation over 12 weeks with live support from operators who've done it." },
    { q: "Do I need experience?", a: "Some familiarity with real estate or lead generation is helpful, but not required. The qualification form helps us tailor the experience to your level." },
    { q: "What happens after the 12 weeks?", a: "You keep replay access and your downloads. Graduates also get access to advanced audit reviews and future seasons." },
];

export function FaqAccordion() {
    return (
        <Accordion type="single">
            {FAQS.map((faq, i) => (
                <AccordionItem key={faq.q} value={`faq-${i}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>
                        <p className="text-base leading-relaxed">{faq.a}</p>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
