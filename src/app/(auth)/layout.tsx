export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-khet-green-light px-4 py-8">
      {children}
    </div>
  );
}
