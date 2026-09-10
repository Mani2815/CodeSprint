import { Mail, MessageCircle, Instagram, Linkedin } from 'lucide-react';
import { Reveal } from '@/components/shared/motion';
import { Eyebrow, H2, Text } from '@/components/shared/typography';

export function ContactSection() {
  return (
    <section id="contact" className="border-t border-border bg-surface/30">
      <div className="container py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Contact</Eyebrow>
          <H2 className="mt-3">Get in Touch</H2>
          <Text className="mt-3 text-muted-foreground">
            Have questions about CodeSprint? We're here to help.
          </Text>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Email</h3>
              <a
                href="mailto:labyrinth.christ@christuniversity.in"
                className="mt-1 block text-sm text-muted-foreground hover:text-primary"
              >
                labyrinth.christ@christuniversity.in
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircle className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">WhatsApp Group</h3>
              <a
                href="https://chat.whatsapp.com/ISRDXRXkifDCOsAz2bHFS0?mode=gi_t"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-muted-foreground hover:text-primary"
              >
                Join our community
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Instagram className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Instagram</h3>
              <a
                href="https://www.instagram.com/labyrinthchrist"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-muted-foreground hover:text-primary"
              >
                @labyrinthchrist
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Linkedin className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">LinkedIn</h3>
              <a
                href="https://www.linkedin.com/school/labyrinthcu"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-muted-foreground hover:text-primary"
              >
                Follow us
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
