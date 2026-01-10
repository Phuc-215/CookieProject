export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="pixel-card bg-white p-10">
        <h1 className="mb-6 text-[var(--text-2xl)] text-[var(--choco)]">
          🍪 Privacy Policy
        </h1>

        <p className="mb-6 text-sm leading-relaxed">
          CookieProject respects your privacy. This Privacy Policy explains how
          we collect, use, and protect your personal information when you use
          our platform.
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="mb-2">1. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information such as username and email</li>
              <li>User-generated content including recipes and images</li>
              <li>Basic usage data to improve performance and experience</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2">2. How We Use Your Information</h2>
            <p>
              We use collected data to operate CookieProject, improve features,
              personalize your experience, and maintain platform security.
            </p>
          </section>

          <section>
            <h2 className="mb-2">3. Data Sharing</h2>
            <p>
              CookieProject does not sell or rent personal information. Data is
              only shared when required by law or to protect the integrity of
              the platform.
            </p>
          </section>

          <section>
            <h2 className="mb-2">4. Cookies</h2>
            <p>
              We may use cookies to enhance functionality and user experience.
              You can disable cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="mb-2">5. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal data.
              These actions can be performed through your account settings or
              by contacting us.
            </p>
          </section>

          <section>
            <h2 className="mb-2">6. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact:
              <br />
              <span className="text-[var(--pink)] font-medium">
                cookieproject@gmail.com
              </span>
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
