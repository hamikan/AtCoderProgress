import Header from "@/components/layout/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-svh overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden contain-layout">
        {children}
      </main>
    </div>
  );
}
