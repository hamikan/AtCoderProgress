'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ルートレイアウトが壊れた場合に使われ、globals.css が読み込まれない可能性があるため inline style を使う
export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 448 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
              表示できませんでした
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#475569' }}>
              一時的な問題が起きた可能性があります。もう一度お試しください。
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                height: 40,
                padding: '0 16px',
                border: 'none',
                borderRadius: 6,
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              もう一度試す
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
