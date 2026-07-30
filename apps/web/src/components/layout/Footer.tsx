import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-surface/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="font-display text-lg text-brand-gold">PJHerbal Clinic</div>
          <p className="mt-2 text-sm text-brand-ink/60">Segerea, Dar es Salaam, Tanzania</p>
          <p className="mt-1 text-sm text-brand-ink/60">+255 000 000 000</p>
        </div>

        <div>
          <h4 className="mb-3 text-xs uppercase tracking-wide text-brand-ink/50">Shop</h4>
          <ul className="space-y-2 text-sm text-brand-ink/70">
            <li><Link href="/shop">All products</Link></li>
            <li><Link href="/blog">Health blog</Link></li>
            <li><Link href="/about">About us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs uppercase tracking-wide text-brand-ink/50">Policies</h4>
          <ul className="space-y-2 text-sm text-brand-ink/70">
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs uppercase tracking-wide text-brand-ink/50">Payment methods</h4>
          <p className="text-sm text-brand-ink/70">M-Pesa · Tigo Pesa · Airtel Money · HaloPesa · CRDB · NMB</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-brand-ink/40">
        © {new Date().getFullYear()} PJHerbal Clinic. All rights reserved.
      </div>
    </footer>
  );
}
