'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface DifficultyPieChartProps {
    data: {
        name: string;
        value: number;
        fill: string;
    }[];
}

export default function DifficultyPieChart({ data }: DifficultyPieChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200 h-full">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-slate-500" />
                        難易度別 AC数
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-slate-500">
                    データがありません
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200 h-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-blue-600" />
                    難易度別 AC数
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | string | Array<number | string> | undefined) => [`${value} AC`, '']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
