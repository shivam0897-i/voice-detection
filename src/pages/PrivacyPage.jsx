import { Shield } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="mx-auto max-w-3xl px-6 py-20 lg:py-28">
            {/* Header */}
            <div className="mb-12 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Shield size={20} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
                    <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-0 [&_strong]:text-foreground [&_li]:text-[14px]">
                <section className="space-y-3">
                    <h2>Introduction</h2>
                    <p className="text-[14px] leading-relaxed">
                        VoiceGuard (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) respects your privacy and is
                        committed to protecting the personal data you share with us. This Privacy Policy explains how we
                        collect, use, and safeguard your information when you use the VoiceGuard platform and API services.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2>Information We Collect</h2>
                    <ul className="list-disc space-y-1.5 pl-6">
                        <li><strong>Account Information:</strong> Email address, name, and organization details when you register.</li>
                        <li><strong>Audio Data:</strong> Voice audio submitted for fraud analysis, processed in real-time.</li>
                        <li><strong>Usage Data:</strong> API call logs, session metadata, and platform interaction analytics.</li>
                        <li><strong>Technical Data:</strong> IP address, browser type, device information, and access timestamps.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2>How We Use Your Data</h2>
                    <ul className="list-disc space-y-1.5 pl-6">
                        <li>To provide real-time voice fraud detection and analysis services.</li>
                        <li>To improve our AI models and detection accuracy (using anonymized, aggregated data only).</li>
                        <li>To monitor and prevent abuse of our platform and API services.</li>
                        <li>To communicate important service updates, security alerts, and billing information.</li>
                        <li>To comply with legal obligations and enforce our Terms of Service.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2>Audio Data Processing</h2>
                    <p className="text-[14px] leading-relaxed">
                        Audio data submitted for analysis is processed in real-time and is <strong>not stored</strong> beyond
                        the duration of the active session unless explicitly configured otherwise in your account settings.
                        We do not use identifiable audio data for model training without explicit consent.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2>Data Security</h2>
                    <p className="text-[14px] leading-relaxed">
                        We implement industry-standard security measures including end-to-end encryption for audio
                        transmission, encrypted storage for account data, and regular security audits. Access to user data
                        is restricted to authorized personnel only.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2>Data Sharing</h2>
                    <p className="text-[14px] leading-relaxed">
                        We do not sell, rent, or share your personal data with third parties for marketing purposes.
                        Data may be shared with service providers who assist in operating our platform, subject to strict
                        confidentiality agreements, or when required by law.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2>Your Rights</h2>
                    <ul className="list-disc space-y-1.5 pl-6">
                        <li><strong>Access:</strong> Request a copy of your personal data we hold.</li>
                        <li><strong>Correction:</strong> Request correction of inaccurate personal data.</li>
                        <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
                        <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
                        <li><strong>Objection:</strong> Object to processing of your personal data.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2>Cookies and Tracking</h2>
                    <p className="text-[14px] leading-relaxed">
                        We use essential cookies to maintain session state and preferences. Analytics cookies are used to
                        understand platform usage patterns. You can manage cookie preferences through your browser settings.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2>Changes to This Policy</h2>
                    <p className="text-[14px] leading-relaxed">
                        We may update this Privacy Policy from time to time. Material changes will be communicated via email
                        or platform notification. Continued use of VoiceGuard after changes constitutes acceptance of the
                        updated policy.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2>Contact</h2>
                    <p className="text-[14px] leading-relaxed">
                        For privacy-related inquiries or to exercise your data rights, please open an issue on our{' '}
                        <a
                            href="https://github.com/shivam0897-i/voice-detection/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary underline underline-offset-4"
                        >
                            GitHub repository
                        </a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
