export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="pixel-card bg-white p-10">
        <h1 className="mb-6 text-[var(--text-2xl)] text-[var(--choco)]">
          📜 Terms of Service
        </h1>

        <p className="mb-6 text-sm leading-relaxed">
          Welcome to CookieProject 🍪. By accessing or using our platform, you
          agree to comply with and be bound by the following Terms of Service.
          If you do not agree, please discontinue use of the platform.
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="mb-2">1. Use of the Platform</h2>
            <p>
              CookieProject is a community-driven platform designed for sharing,
              discovering, and collecting recipes. You agree to use the
              platform responsibly and only for lawful purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-2">2. User Content</h2>
            <p>
              You retain ownership of all content you submit, including recipes,
              images, and comments. By posting content, you grant CookieProject
              permission to display and distribute your content within the
              platform.
            </p>
          </section>

          <section>
            <h2 className="mb-2">3. Accounts & Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. Any activity that occurs under your account
              is considered your responsibility.
            </p>
          </section>

          <section>
            <h2 className="mb-2">4. Prohibited Activities</h2>
            <p>
              You agree not to upload content that is harmful, misleading,
              abusive, or illegal. CookieProject reserves the right to remove
              such content without prior notice.
            </p>
          </section>

          <section>
            <h2 className="mb-2">5. Termination</h2>
            <p>
              We may suspend or terminate your access to CookieProject if you
              violate these Terms or engage in behavior that harms the
              community.
            </p>
          </section>

          <section>
            <h2 className="mb-2">6. Disclaimer</h2>
            <p>
              CookieProject is provided “as is” without warranties of any kind.
              We do not guarantee uninterrupted or error-free service.
            </p>
          </section>

          <section>
            <h2 className="mb-2">7. Changes to Terms</h2>
            <p>
              These Terms may be updated from time to time. Continued use of the
              platform indicates acceptance of the updated Terms.
            </p>
          </section>
        </div>

        <p className="mt-10 text-xs opacity-70">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}