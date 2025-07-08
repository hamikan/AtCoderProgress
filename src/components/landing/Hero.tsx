
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900">
          あなたのAtCoderライフを、<br />
          <span className="text-indigo-600">最短距離で</span>成長へ導く。
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          日々の精進を記録・可視化し、苦手分野を自動で特定。
          <br />
          最適な「次の課題」を提示することで、あなたの成長をサポートします。
        </p>
        <div className="mt-8">
          <Link href="/register" className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            無料で始める
          </Link>
        </div>
      </div>
    </section>
  );
}
