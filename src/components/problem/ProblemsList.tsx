// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { CheckCircle, Clock, XCircle, Eye, ExternalLink, BookOpen } from 'lucide-react';
// import { Problem } from '@/types/problem';
// import { Pagination } from '@/components/ui/pagination';

// interface ProblemsListProps {
//   problems: Problem[];
//   totalProblems: number;
//   currentPage: number;
//   itemsPerPage: number;
// }

// const getUserSolutionStatus = (problem: Problem) => {
//   if (problem.solutions && problem.solutions.length > 0) {
//     return problem.solutions[0].status;
//   }
//   if (problem.submissions && problem.submissions.some(sub => sub.result === 'AC')) {
//     return 'SELF_AC';
//   }
//   return null;
// };

// const getProblemTags = (problem: Problem) => {
//   if (!problem.solutions) return [];
//   const tags = new Set<string>();
//   problem.solutions.forEach(solution => {
//     solution.tags.forEach(solutionTag => {
//       tags.add(solutionTag.tag.name);
//     });
//   });
//   return Array.from(tags);
// };

// export default function ProblemsList({ problems, totalProblems, currentPage, itemsPerPage }: ProblemsListProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const totalPages = Math.ceil(totalProblems / itemsPerPage);

//   const handlePageChange = (page: number) => {
//     const params = new URLSearchParams(searchParams);
//     params.set('page', page.toString());
//     router.push(`?${params.toString()}`);
//   };

//   const getStatusIcon = (status: string | null) => {
//     switch (status) {
//       case 'SELF_AC':
//       case 'REVIEW_AC':
//         return <CheckCircle className="h-4 w-4 text-emerald-600" />;
//       case 'EXPLANATION_AC':
//         return <Eye className="h-4 w-4 text-blue-600" />;
//       case 'TRYING':
//         return <Clock className="h-4 w-4 text-amber-600" />;
//       default:
//         return <XCircle className="h-4 w-4 text-slate-300" />;
//     }
//   };

//   const getStatusLabel = (status: string | null) => {
//     switch (status) {
//       case 'SELF_AC': return '自力AC';
//       case 'EXPLANATION_AC': return '解説AC';
//       case 'REVIEW_AC': return '復習AC';
//       case 'TRYING': return '挑戦中';
//       default: return '未挑戦';
//     }
//   };

//   const getStatusColor = (status: string | null) => {
//     switch (status) {
//       case 'SELF_AC': return 'bg-emerald-100 text-emerald-700';
//       case 'EXPLANATION_AC': return 'bg-blue-100 text-blue-700';
//       case 'REVIEW_AC': return 'bg-purple-100 text-purple-700';
//       case 'TRYING': return 'bg-amber-100 text-amber-700';
//       default: return 'bg-slate-100 text-slate-700';
//     }
//   };

//   const getDifficultyColor = (difficulty: number | null) => {
//     if (difficulty === null) return 'text-slate-400';
//     if (difficulty < 400) return 'text-gray-600';
//     if (difficulty < 800) return 'text-amber-600';
//     if (difficulty < 1200) return 'text-emerald-600';
//     if (difficulty < 1600) return 'text-blue-600';
//     if (difficulty < 2000) return 'text-purple-600';
//     if (difficulty < 2400) return 'text-red-600';
//     return 'text-red-800';
//   };

//   return (
//     <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200">
//       <CardHeader>
//         <CardTitle className="text-lg font-semibold text-slate-900">
//           問題一覧 ({totalProblems}件)
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="rounded-lg border border-slate-200 overflow-hidden">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-slate-50">
//                   <TableHead className="w-16">状態</TableHead>
//                   <TableHead>問題名</TableHead>
//                   <TableHead className="w-24">難易度</TableHead>
//                   <TableHead className="w-32">コンテスト</TableHead>
//                   <TableHead className="w-48">タグ</TableHead>
//                   <TableHead className="w-24">解答数</TableHead>
//                   <TableHead className="w-32">アクション</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {problems.map((problem) => {
//                   const status = getUserSolutionStatus(problem);
//                   const tags = getProblemTags(problem);
//                   return (
//                     <TableRow key={problem.id} className="hover:bg-slate-50">
//                       <TableCell>
//                         <div className="flex items-center justify-center">
//                           {getStatusIcon(status)}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="space-y-1">
//                           <Link href={`/problems/${problem.id}`} className="font-medium text-slate-900 hover:underline">
//                             {problem.contestId.toUpperCase()}-{problem.problemIndex}: {problem.name}
//                           </Link>
//                           <Badge className={`text-xs ${getStatusColor(status)}`}>
//                             {getStatusLabel(status)}
//                           </Badge>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <span className={`font-medium ${getDifficultyColor(problem.difficulty)}`}>
//                           {problem.difficulty ?? '-'}
//                         </span>
//                       </TableCell>
//                       <TableCell>
//                         <Link href={`https://atcoder.jp/contests/${problem.contestId}`} target="_blank" className="text-sm text-slate-600 hover:underline">
//                           {problem.contestId.toUpperCase()}
//                         </Link>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex flex-wrap gap-1">
//                           {tags.slice(0, 3).map((tag, index) => (
//                             <Badge key={index} variant="outline" className="text-xs">
//                               {tag}
//                             </Badge>
//                           ))}
//                           {tags.length > 3 && (
//                             <Badge variant="outline" className="text-xs">
//                               +{tags.length - 3}
//                             </Badge>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <span className="text-sm text-slate-600">
//                           {problem.totalSolutionsCount.toLocaleString()}
//                         </span>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center space-x-1">
//                           <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
//                             <Link href={`https://atcoder.jp/contests/${problem.contestId}/tasks/${problem.id}`} target="_blank">
//                               <ExternalLink className="h-4 w-4" />
//                             </Link>
//                           </Button>
//                           <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
//                             <Link href={`/solutions/new?problemId=${problem.id}`}>
//                               <BookOpen className="h-4 w-4" />
//                             </Link>
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </div>
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={handlePageChange}
//           />
//         </div>
//       </CardContent>
//     </Card>
//   );
// }