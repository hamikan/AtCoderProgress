// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// import { Menu, User, BarChart3, BookOpen, Target, Users, Settings, LogOut, Code2 } from "lucide-react"

// export default function Header() {
//   const [isOpen, setIsOpen] = useState(false)

//   // モックデータ - 実際の実装では認証状態を管理
//   const isLoggedIn = true
//   const user = {
//     name: "田中太郎",
//     atcoderId: "tanaka_taro",
//     avatar: "/placeholder.svg?height=32&width=32",
//   }

//   const navigationItems = [
//     { href: "/dashboard", label: "ダッシュボード", icon: BarChart3 },
//     { href: "/problems", label: "精進記録", icon: BookOpen },
//     { href: "/recommendations", label: "問題推薦", icon: Target },
//     { href: "/social", label: "ソーシャル", icon: Users },
//   ]

//   return (
//     <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="container flex h-16 items-center justify-between px-4">
//         {/* ロゴ */}
//         <Link href="/" className="flex items-center space-x-2">
//           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
//             <Code2 className="h-5 w-5" />
//           </div>
//           <span className="text-xl font-bold text-slate-900">AtCoder Progress</span>
//         </Link>

//         {/* デスクトップナビゲーション */}
//         <nav className="hidden md:flex items-center space-x-6">
//           {navigationItems.map((item) => (
//             <Link
//               key={item.href}
//               href={item.href}
//               className="flex items-center space-x-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
//             >
//               <item.icon className="h-4 w-4" />
//               <span>{item.label}</span>
//             </Link>
//           ))}
//         </nav>

//         {/* 右側のアクション */}
//         <div className="flex items-center space-x-4">
//           {isLoggedIn ? (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//                   <Avatar className="h-8 w-8">
//                     <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
//                     <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
//                   </Avatar>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-56" align="end" forceMount>
//                 <div className="flex items-center justify-start gap-2 p-2">
//                   <div className="flex flex-col space-y-1 leading-none">
//                     <p className="font-medium">{user.name}</p>
//                     <p className="w-[200px] truncate text-sm text-muted-foreground">@{user.atcoderId}</p>
//                   </div>
//                 </div>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem asChild>
//                   <Link href="/profile" className="flex items-center">
//                     <User className="mr-2 h-4 w-4" />
//                     <span>プロフィール</span>
//                   </Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem asChild>
//                   <Link href="/settings" className="flex items-center">
//                     <Settings className="mr-2 h-4 w-4" />
//                     <span>設定</span>
//                   </Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem className="text-red-600">
//                   <LogOut className="mr-2 h-4 w-4" />
//                   <span>ログアウト</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           ) : (
//             <div className="flex items-center space-x-2">
//               <Button variant="ghost" asChild>
//                 <Link href="/login">ログイン</Link>
//               </Button>
//               <Button asChild>
//                 <Link href="/register">新規登録</Link>
//               </Button>
//             </div>
//           )}

//           {/* モバイルメニュー */}
//           <Sheet open={isOpen} onOpenChange={setIsOpen}>
//             <SheetTrigger asChild>
//               <Button variant="ghost" size="icon" className="md:hidden">
//                 <Menu className="h-5 w-5" />
//                 <span className="sr-only">メニューを開く</span>
//               </Button>
//             </SheetTrigger>
//             <SheetContent side="right" className="w-[300px] sm:w-[400px]">
//               <div className="flex flex-col space-y-4 mt-4">
//                 {navigationItems.map((item) => (
//                   <Link
//                     key={item.href}
//                     href={item.href}
//                     className="flex items-center space-x-2 text-lg font-medium text-slate-600 hover:text-slate-900 transition-colors"
//                     onClick={() => setIsOpen(false)}
//                   >
//                     <item.icon className="h-5 w-5" />
//                     <span>{item.label}</span>
//                   </Link>
//                 ))}
//               </div>
//             </SheetContent>
//           </Sheet>
//         </div>
//       </div>
//     </header>
//   )
// }
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Settings, LogOut, User, Code2, Home } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-slate-600 to-slate-800">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">AtCoder Progress</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="flex items-center space-x-2 text-sm font-medium text-slate-900">
              <Home className="h-4 w-4" />
              <span>ダッシュボード</span>
            </a>
            <a href="/problems" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              問題一覧
            </a>
            <a href="/solutions" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              解法記録
            </a>
            <a href="/analytics" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              分析
            </a>
          </nav>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/user.jpg" alt="User" />
                  <AvatarFallback>YU</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">yamada_taro</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    AtCoder: yamada_taro
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1">
                    Rating: 1247
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>プロフィール</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>設定</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>ログアウト</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}