import { lookupTimeCurve } from './time-curve';

/**
 * 独自 difficulty 推定（irt5_time）。
 *
 * 1つのコンテストの順位表から、そのコンテストの各問題の difficulty を推定する。
 *
 * - 対象ユーザー: Competitions >= 5 かつ OldRating > 0 かつ 1回以上提出した人
 * - 能力 A は OldRating をそのまま使う
 * - AC の定義は満点のみ（Status == 1 かつ Score == その問題の最高得点）。
 *   未提出の人は非ACとして扱う
 * - IRT項: AC確率 1 / (1 + 6^((D - A) / 400))
 * - 時間項: ACした人の増分時間（その前に解いた問題の Elapsed からの差分）に対し、
 *   典型時間カーブ（time-curve-data）との Laplace 尤度を掛ける
 * - D は対数尤度和が最大になる値を [-1000, 5000] の範囲で探す（刻み 25 → 5 → 1）
 */

export interface StandingsTaskResult {
  Count?: number | null;
  Score?: number | null;
  Elapsed?: number | null;
  Status?: number | null;
}

export interface StandingsEntry {
  IsTeam?: boolean | null;
  UserIsDeleted?: boolean | null;
  Competitions: number;
  OldRating: number;
  TaskResults?: Record<string, StandingsTaskResult | null | undefined> | null;
}

export interface ContestStandings {
  TaskInfo: Array<{ TaskScreenName: string }>;
  StandingsData: StandingsEntry[];
}

export interface DifficultyEstimate {
  /** 推定した difficulty（表示用の clipDifficulty 適用前の値） */
  difficulty: number;
  /** 推定に使ったユーザー数 */
  userCount: number;
  /** 選別後のユーザーのうち AC した人数 */
  acCount: number;
  /** 時間項に使えた AC 観測の数 */
  acTimeCount: number;
  /** 推定値が探索範囲の端に張り付いているかどうか */
  atBoundary: boolean;
}

const D_MIN = -1000;
const D_MAX = 5000;
const LOG_6 = Math.log(6);
const NANOSECONDS_PER_MINUTE = 60_000_000_000;

interface SelectedUser {
  ability: number;
  /** taskId -> ACしたかどうか */
  ac: Map<string, boolean>;
  /** taskId -> log(増分時間[分])。時間項に使える場合のみ存在する */
  logTime: Map<string, number>;
}

function computeMaxScores(standings: ContestStandings): Map<string, number> {
  const maxScores = new Map<string, number>();
  for (const entry of standings.StandingsData) {
    for (const [taskId, result] of Object.entries(entry.TaskResults ?? {})) {
      const score = result?.Score ?? 0;
      if (score > (maxScores.get(taskId) ?? -1)) {
        maxScores.set(taskId, score);
      }
    }
  }
  return maxScores;
}

function parseUser(
  entry: StandingsEntry,
  maxScores: Map<string, number>
): SelectedUser | null {
  if (entry.IsTeam || entry.UserIsDeleted) return null;
  const taskResults = entry.TaskResults ?? {};

  let submissionCount = 0;
  const ac = new Map<string, boolean>();
  const acTimes: Array<{ elapsed: number; taskId: string }> = [];
  for (const [taskId, result] of Object.entries(taskResults)) {
    submissionCount += result?.Count ?? 0;
    const maxScore = maxScores.get(taskId) ?? 0;
    const isAc =
      result?.Status === 1 && maxScore > 0 && (result?.Score ?? 0) === maxScore;
    ac.set(taskId, isAc);
    if (isAc) {
      const elapsed = result?.Elapsed ?? 0;
      if (elapsed > 0) {
        acTimes.push({ elapsed, taskId });
      }
    }
  }

  if (entry.Competitions < 5 || entry.OldRating <= 0 || submissionCount < 1) {
    return null;
  }

  acTimes.sort(
    (a, b) =>
      a.elapsed - b.elapsed ||
      (a.taskId < b.taskId ? -1 : a.taskId > b.taskId ? 1 : 0)
  );
  const logTime = new Map<string, number>();
  let previousElapsed = 0;
  for (const { elapsed, taskId } of acTimes) {
    const minutes = (elapsed - previousElapsed) / NANOSECONDS_PER_MINUTE;
    if (minutes > 0) {
      logTime.set(taskId, Math.log(minutes));
    }
    previousElapsed = elapsed;
  }

  return { ability: entry.OldRating, ac, logTime };
}

/** log(1 + exp(z)) を数値的に安定に計算する */
function softplus(z: number): number {
  return z > 0 ? z + Math.log1p(Math.exp(-z)) : Math.log1p(Math.exp(z));
}

interface AbilityGroup {
  ability: number;
  users: SelectedUser[];
}

interface TaskData {
  /** AbilityGroup と同じ並びの、各グループで AC した人数 */
  acCounts: Float64Array;
  timeAbilities: Float64Array;
  logTimes: Float64Array;
  acCount: number;
}

function buildTaskData(groups: AbilityGroup[], taskId: string): TaskData {
  const acCounts = new Float64Array(groups.length);
  const timeAbilities: number[] = [];
  const logTimes: number[] = [];
  let acCount = 0;
  groups.forEach((group, groupIndex) => {
    let groupAc = 0;
    for (const user of group.users) {
      if (user.ac.get(taskId)) {
        groupAc++;
        const logTime = user.logTime.get(taskId);
        if (logTime !== undefined) {
          timeAbilities.push(user.ability);
          logTimes.push(logTime);
        }
      }
    }
    acCounts[groupIndex] = groupAc;
    acCount += groupAc;
  });
  return {
    acCounts,
    timeAbilities: Float64Array.from(timeAbilities),
    logTimes: Float64Array.from(logTimes),
    acCount,
  };
}

function logLikelihood(d: number, groups: AbilityGroup[], task: TaskData): number {
  const k = LOG_6 / 400;
  let total = 0;
  groups.forEach((group, groupIndex) => {
    const z = (d - group.ability) * k;
    const ac = task.acCounts[groupIndex] ?? 0;
    const nonAc = group.users.length - ac;
    if (ac > 0) total += ac * -softplus(z);
    if (nonAc > 0) total += nonAc * -softplus(-z);
  });
  for (let i = 0; i < task.timeAbilities.length; i++) {
    const ability = task.timeAbilities[i] ?? 0;
    const { m, s } = lookupTimeCurve((d - ability) / 400);
    total += -Math.log(2 * s) - Math.abs((task.logTimes[i] ?? 0) - m) / s;
  }
  return total;
}

function maximizeDifficulty(groups: AbilityGroup[], task: TaskData): number {
  const scanBest = (from: number, to: number, step: number): number => {
    let bestD = from;
    let bestValue = -Infinity;
    for (let d = from; d <= to + step / 2; d += step) {
      const value = logLikelihood(d, groups, task);
      if (value > bestValue) {
        bestValue = value;
        bestD = d;
      }
    }
    return bestD;
  };
  let best = scanBest(D_MIN, D_MAX, 25);
  best = scanBest(Math.max(D_MIN, best - 25), Math.min(D_MAX, best + 25), 5);
  best = scanBest(Math.max(D_MIN, best - 5), Math.min(D_MAX, best + 5), 1);
  return best;
}

/**
 * コンテストの順位表から、各問題の difficulty を irt5_time で推定する。
 * 対象ユーザーが1人もいない場合は空の Map を返す。
 */
export function estimateContestDifficulties(
  standings: ContestStandings
): Map<string, DifficultyEstimate> {
  const maxScores = computeMaxScores(standings);
  const users: SelectedUser[] = [];
  for (const entry of standings.StandingsData) {
    const user = parseUser(entry, maxScores);
    if (user) users.push(user);
  }

  const estimates = new Map<string, DifficultyEstimate>();
  if (users.length === 0) return estimates;

  const groupsByAbility = new Map<number, SelectedUser[]>();
  for (const user of users) {
    const group = groupsByAbility.get(user.ability);
    if (group) {
      group.push(user);
    } else {
      groupsByAbility.set(user.ability, [user]);
    }
  }
  const groups: AbilityGroup[] = [...groupsByAbility.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([ability, groupUsers]) => ({ ability, users: groupUsers }));

  for (const task of standings.TaskInfo) {
    const taskId = task.TaskScreenName;
    const taskData = buildTaskData(groups, taskId);
    const difficulty = maximizeDifficulty(groups, taskData);
    estimates.set(taskId, {
      difficulty,
      userCount: users.length,
      acCount: taskData.acCount,
      acTimeCount: taskData.logTimes.length,
      atBoundary: difficulty <= D_MIN || difficulty >= D_MAX,
    });
  }
  return estimates;
}
