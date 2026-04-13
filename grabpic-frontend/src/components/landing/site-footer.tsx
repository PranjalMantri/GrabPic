const footerLinks = {
  Product: ["Features", "AI Curator", "Sharing", "Pricing"],
  Company: ["About", "Privacy", "Terms", "Security"],
  Support: ["Help Center", "API Docs", "Community"],
};

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-6xl border-t border-[var(--color-border)] pt-12 pb-8">
      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <h4 className="text-3xl font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">GrabPic</h4>
          <p className="mt-4 max-w-xs text-sm leading-7 text-[var(--color-text-secondary)]">
            The world&apos;s most sophisticated AI platform for event photo discovery and curation.
          </p>
          <div className="mt-5 flex gap-2">
            <div className="h-8 w-8 rounded-full bg-[#e9edf6]" />
            <div className="h-8 w-8 rounded-full bg-[#e9edf6]" />
          </div>
        </div>

        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h5 className="text-sm font-semibold uppercase tracking-[0.04em] text-[var(--color-text-primary)]">
              {heading}
            </h5>
            <ul className="mt-5 space-y-3 text-sm text-[var(--color-text-secondary)]">
              {links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col justify-between gap-3 border-t border-[var(--color-border-subtle)] pt-6 text-sm text-[var(--color-text-tertiary)] md:flex-row">
        <p>© 2026 GrabPic AI Platform. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#">Privacy Policy</a>
          <a href="#">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
}
