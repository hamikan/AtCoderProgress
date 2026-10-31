import assert from 'node:assert/strict';
import test from 'node:test';

import {
  estimateContestDifficulties,
  type ContestStandings,
  type StandingsEntry,
} from './estimate-difficulty';

const NANOSECONDS_PER_SECOND = 1_000_000_000;

function taskResult(count: number, score: number, elapsedSecond: number, status: number) {
  return {
    Count: count,
    Score: score,
    Elapsed: elapsedSecond * NANOSECONDS_PER_SECOND,
    Status: status,
  };
}

function entry(
  competitions: number,
  oldRating: number,
  taskResults: StandingsEntry['TaskResults'],
  isTeam = false
): StandingsEntry {
  return {
    IsTeam: isTeam,
    UserIsDeleted: false,
    Competitions: competitions,
    OldRating: oldRating,
    TaskResults: taskResults,
  };
}

/**
 * 合成順位表によるゴールデンテスト。
 * 期待値（ex_a: 328, ex_b: 1431）は、実験用 Python 実装
 * （irt5_time、OldRating 基準カーブ）で同じ順位表を推定した結果。
 */
function buildFixture(): ContestStandings {
  const entries: StandingsEntry[] = [];
  for (let i = 0; i < 20; i++) {
    const rating = 400 + i * 100;
    const taskResults: NonNullable<StandingsEntry['TaskResults']> = {
      ex_a: taskResult(1, 100, 300 + i * 30, 1),
    };
    if (rating >= 1500) {
      taskResults.ex_b = taskResult(2, 500, 300 + i * 30 + 900, 1);
    } else if (rating >= 1200) {
      // 満点でないスコアでの Status==1 は AC として数えない（部分点の問題）
      taskResults.ex_b = taskResult(3, 300, 0, 1);
    }
    entries.push(entry(10, rating, taskResults));
  }
  // Competitions < 5 の人は選別で除外される
  entries.push(
    entry(3, 2000, {
      ex_a: taskResult(1, 100, 60, 1),
      ex_b: taskResult(1, 500, 120, 1),
    })
  );
  // OldRating == 0 の人は選別で除外される
  entries.push(
    entry(10, 0, {
      ex_a: taskResult(1, 100, 60, 1),
      ex_b: taskResult(1, 500, 120, 1),
    })
  );
  // チームは対象ユーザーに入らない（最高得点の集計には含まれる）
  entries.push(
    entry(
      10,
      1500,
      {
        ex_a: taskResult(1, 100, 200, 1),
        ex_b: taskResult(1, 400, 800, 1),
      },
      true
    )
  );
  return {
    TaskInfo: [{ TaskScreenName: 'ex_a' }, { TaskScreenName: 'ex_b' }],
    StandingsData: entries,
  };
}

test('estimateContestDifficulties reproduces the reference estimates', () => {
  const estimates = estimateContestDifficulties(buildFixture());
  const a = estimates.get('ex_a');
  const b = estimates.get('ex_b');
  assert.ok(a && b);
  assert.ok(Math.abs(a.difficulty - 328) <= 1, `ex_a: ${a.difficulty}`);
  assert.ok(Math.abs(b.difficulty - 1431) <= 1, `ex_b: ${b.difficulty}`);
  assert.equal(a.userCount, 20);
  assert.equal(b.userCount, 20);
  assert.equal(a.acCount, 20);
  assert.equal(b.acCount, 9);
  assert.equal(a.acTimeCount, 20);
  assert.equal(b.acTimeCount, 9);
  assert.equal(a.atBoundary, false);
  assert.equal(b.atBoundary, false);
});

test('estimateContestDifficulties returns an empty map when no user is selected', () => {
  const estimates = estimateContestDifficulties({
    TaskInfo: [{ TaskScreenName: 'ex_a' }],
    StandingsData: [entry(3, 2000, { ex_a: taskResult(1, 100, 60, 1) })],
  });
  assert.equal(estimates.size, 0);
});
