export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center font-display text-2xl text-brand-gold">
          PJHerbal Clinic
        </div>
        {children}
      </div>
    </div>
  );
}
