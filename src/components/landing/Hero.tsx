'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Target, Users } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/5 to-blue-800/5" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-700/10">
            <TrendingUp className="mr-2 h-4 w-4" />
            最短距離で成長をサポート
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            AtCoderの
            <span className="bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
              精進を革新する
            </span>
          </h1>

          {/* Subheading */}
          <p className="mb-10 text-lg leading-8 text-slate-600 sm:text-xl">
            苦手分野を自動で特定し、あなたの実力に最適な「次の課題」を提示。
            <br className="hidden sm:block" />
            日々の精進を記録・可視化して、最短距離での成長を実現します。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-slate-600 to-slate-800 px-8 hover:from-slate-700 hover:to-slate-900"
            >
              無料で始める
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              デモを見る
            </Button>
          </div>

          {/* Stats */}
          {/* <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12">
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">97%</div>
              <div className="text-sm text-slate-600">推薦精度</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">3.2x</div>
              <div className="text-sm text-slate-600">成長速度向上</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">10,000+</div>
              <div className="text-sm text-slate-600">利用者数</div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-slate-200 to-blue-200 opacity-30"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  );
}