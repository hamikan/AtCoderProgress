
import { CheckCircleIcon } from '@heroicons/react/24/solid'; // アイコンを使用

const features = [
  {
    name: '精進の可視化',
    description: 'カレンダーヒートマップやレーダーチャートで、あなたの学習履歴や得意・不得意分野を一目で把握できます。',
  },
  {
    name: '解法の一元管理',
    description: '問題ごとにコードや思考メモを記録し、ステータス管理も可能。自分だけの最強の解法集を作り上げましょう。',
  },
  {
    name: 'パーソナライズド問題推薦',
    description: '苦手なアルゴリズムタグを自動で分析し、今のあなたに最適な「次の一問」を推薦。効率的な学習をサポートします。',
  },
];

export default function Features() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">主な機能</h2>
          <p className="mt-4 text-lg text-gray-600">AtCoder Progressがあなたの学習を強力にサポートします。</p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-indigo-600" />
                <h3 className="ml-4 text-2xl font-semibold text-gray-900">{feature.name}</h3>
              </div>
              <p className="mt-4 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
