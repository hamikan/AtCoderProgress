// 'use client';

// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { CheckCircle, Clock, XCircle, Eye, ExternalLink, BookOpen, Calendar } from 'lucide-react';
// import { Problem } from '@/types/problem';
// import { Pagination } from '@/components/ui/pagination';

// interface ProblemsGridProps {
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

// export default function ProblemsGrid({ problems, totalProblems, currentPage, itemsPerPage }: ProblemsGridProps) {
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

//   const formatDate = (date: Date | null) => {
//     if (!date) return null;
//     return new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
//   };

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//         {problems.map((problem) => {
//           const status = getUserSolutionStatus(problem);
//           const tags = getProblemTags(problem);
//           const solvedAt = problem.solutions?.[0]?.solvedAt;

//           return (
//             <Card key={problem.id} className="border-0 bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-all group flex flex-col">
//               <CardHeader className="pb-3">
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-center space-x-2">
//                     {getStatusIcon(status)}
//                     <Badge className={`text-xs ${getStatusColor(status)}`}>
//                       {getStatusLabel(status)}
//                     </Badge>
//                   </div>
//                   <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
//                     {problem.difficulty ?? '-'}
//                   </span>
//                 </div>
//                 <CardTitle className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-slate-700 pt-2">
//                   <Link href={`/problems/${problem.id}`}>
//                     {problem.contestId.toUpperCase()}-{problem.problemIndex}: {problem.name}
//                   </Link>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3 flex-grow flex flex-col justify-between">
//                 <div>
//                   <div className="text-xs text-slate-600">
//                     {problem.contestId.toUpperCase()}
//                   </div>
//                   <div className="flex flex-wrap gap-1 mt-2">
//                     {tags.slice(0, 2).map((tag, index) => (
//                       <Badge key={index} variant="outline" className="text-xs">
//                         {tag}
//                       </Badge>
//                     ))}
//                     {tags.length > 2 && (
//                       <Badge variant="outline" className="text-xs">
//                         +{tags.length - 2}
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//                 <div className="pt-2">
//                   {solvedAt && (
//                     <div className="flex items-center space-x-1 text-xs text-slate-500">
//                       <Calendar className="h-3 w-3" />
//                       <span>{formatDate(solvedAt)}</span>
//                     </div>
//                   )}
//                   <div className="text-xs text-slate-500 mt-1">
//                     {problem.totalSolutionsCount.toLocaleString()}人が解答
//                   </div>
//                 </div>
//               </CardContent>
//               <div className="flex items-center justify-end p-2 border-t border-slate-100">
//                 <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
//                   <Link href={`https://atcoder.jp/contests/${problem.contestId}/tasks/${problem.id}`} target="_blank">
//                     <ExternalLink className="h-4 w-4" />
//                   </Link>
//                 </Button>
//                 <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
//                   <Link href={`/solutions/new?problemId=${problem.id}`}>
//                     <BookOpen className="h-4 w-4" />
//                   </Link>
//                 </Button>
//               </div>
//             </Card>
//           );
//         })}
//       </div>
//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={handlePageChange}
//       />
//     </div>
//   );
// }