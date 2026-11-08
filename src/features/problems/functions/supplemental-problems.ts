/**
 * AtCoder Problems の問題一覧に載っていない問題を、手で補う一覧。
 *
 * 一覧にない問題への提出は問題データ待ちのまま数に入らないため、提出がある問題をここに足す。
 * 名前と番号は AtCoder の問題一覧（https://atcoder.jp/contests/<contest>/tasks）に合わせる。
 * あとから AtCoder Problems に載ったものは、そちらの値が使われる（normalize-contest-data.ts）。
 */
export const SUPPLEMENTAL_PROBLEMS = [
  { id: 'APG4bPython_ci', name: '隣り合う同じ値を探す', contestId: 'APG4bPython', problemIndex: 'EX14' },
  { id: 'APG4bPython_ch', name: '果物屋さんでお買い物', contestId: 'APG4bPython', problemIndex: 'EX15' },
  { id: 'APG4bPython_cg', name: '英単語テスト対策', contestId: 'APG4bPython', problemIndex: 'EX16' },
  { id: 'APG4bPython_cf', name: 'ゲーム大会', contestId: 'APG4bPython', problemIndex: 'EX17' },
  { id: 'APG4bPython_ce', name: '報告書の枚数', contestId: 'APG4bPython', problemIndex: 'EX18' },
  { id: 'APG4bPython_cd', name: '計算量の見積もり', contestId: 'APG4bPython', problemIndex: 'EX19' },
] as const;
