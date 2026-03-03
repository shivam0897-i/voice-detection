'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function TocDialog() {
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const contentRef = useRef(null);

  const handleScroll = () => {
    const content = contentRef.current;
    if (!content) return;

    const scrollPercentage =
      content.scrollTop / (content.scrollHeight - content.clientHeight);
    if (scrollPercentage >= 0.99 && !hasReadToBottom) {
      setHasReadToBottom(true);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-[13px] text-muted-foreground/80 transition-colors hover:text-brand-400 cursor-pointer bg-transparent border-none p-0 text-left">
          Terms &amp; Conditions
        </button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 max-h-[85vh] sm:max-h-[min(640px,80vh)] w-[calc(100%-2rem)] sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Terms &amp; Conditions
          </DialogTitle>
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="overflow-y-auto"
          >
            <DialogDescription asChild>
              <div className="px-6 py-4">
                <div className="[&_strong]:text-foreground space-y-4 [&_strong]:font-semibold">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p><strong>Acceptance of Terms</strong></p>
                      <p>
                        By accessing and using VoiceGuard, users agree to comply with and be bound by
                        these Terms of Service. Users who do not agree with these terms should
                        discontinue use of the platform immediately.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p><strong>User Account Responsibilities</strong></p>
                      <p>
                        Users are responsible for maintaining the confidentiality of their account
                        credentials. Any activities occurring under a user&rsquo;s account are the sole
                        responsibility of the account holder. Users must notify VoiceGuard administrators
                        immediately of any unauthorized account access.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p><strong>API Usage and Rate Limits</strong></p>
                      <p>
                        VoiceGuard provides voice fraud detection APIs subject to usage limits defined by
                        your subscription tier. Exceeding rate limits may result in temporary throttling
                        or suspension of API access. Users may not reverse-engineer, decompile, or
                        attempt to extract the underlying models or algorithms.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p><strong>Data Processing and Privacy</strong></p>
                      <p>
                        Audio data submitted for analysis is processed in real-time and is not stored
                        beyond the duration of the active session unless explicitly configured otherwise.
                        VoiceGuard complies with applicable data protection regulations including GDPR
                        and CCPA where applicable.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p><strong>Limitation of Liability</strong></p>
                      <p>
                        VoiceGuard provides its services &ldquo;as is&rdquo; without any warranties,
                        express or implied. VoiceGuard shall not be liable for direct, indirect,
                        incidental, consequential, or punitive damages arising from use of or inability
                        to use the platform, including but not limited to losses resulting from
                        undetected fraudulent voice activity.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p><strong>User Conduct Guidelines</strong></p>
                      <ul className="list-disc pl-6">
                        <li>Not upload harmful or malicious content</li>
                        <li>Not use the API for unlawful surveillance or monitoring</li>
                        <li>Respect the rights and privacy of individuals whose voices are analyzed</li>
                        <li>Comply with applicable local and international laws</li>
                        <li>Not attempt to circumvent rate limits or security measures</li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <p><strong>Modifications to Terms</strong></p>
                      <p>
                        VoiceGuard reserves the right to modify these terms at any time. Users will be
                        notified of material changes via email or platform notification. Continued use
                        of VoiceGuard after changes constitutes acceptance of the updated terms.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p><strong>Termination Clause</strong></p>
                      <p>
                        VoiceGuard may terminate or suspend user access without prior notice for
                        violations of these terms, suspected fraudulent activity, or for any other
                        reason deemed appropriate by the administration.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p><strong>Governing Law</strong></p>
                      <p>
                        These terms are governed by the laws of the jurisdiction where VoiceGuard is
                        primarily operated, without regard to conflict of law principles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="border-t border-border px-6 py-4 sm:items-center">
          {!hasReadToBottom && (
            <span className="text-muted-foreground grow text-xs max-sm:text-center">
              Read all terms before accepting.
            </span>
          )}
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" disabled={!hasReadToBottom}>
              I agree
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
