import { useEffect, useState } from "react";

export default function HealthcheckPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/healthz")
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-black/60 backdrop-blur-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">TinyLink Healthcheck</h1>

        {loading ? (
          <p className="text-slate-300">Checking system status…</p>
        ) : (
          <>
            <div className="text-left space-y-2 text-sm">
              <p>
                <span className="text-slate-400">Status:</span>{" "}
                <span
                  className={
                    data?.ok
                      ? "text-emerald-300 font-semibold"
                      : "text-red-300 font-semibold"
                  }
                >
                  {data?.status}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Database:</span>{" "}
                <span
                  className={
                    data?.database === "connected"
                      ? "text-emerald-300"
                      : "text-red-300"
                  }
                >
                  {data?.database}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Version:</span>{" "}
                <span className="text-indigo-300">{data?.version}</span>
              </p>
              <p>
                <span className="text-slate-400">Timestamp:</span>{" "}
                <span className="text-slate-300">{data?.timestamp}</span>
              </p>
            </div>

            <div className="mt-4">
              <a
                href="/"
                className="text-indigo-300 underline underline-offset-2 hover:text-indigo-200"
              >
                ← Back to Dashboard
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
