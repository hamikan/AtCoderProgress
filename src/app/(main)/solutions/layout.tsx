import SolutionsSidebarStateProvider from '@/features/solutions/components/SolutionsSidebarStateProvider';

export default function SolutionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SolutionsSidebarStateProvider>{children}</SolutionsSidebarStateProvider>;
}
