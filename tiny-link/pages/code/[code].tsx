import { GetServerSideProps } from "next";
import Head from "next/head";
import { query } from "../../lib/db";
import { useEffect, useState } from "react";

type Link = {
  code: string;
  url: string;
  total_clicks: number;
  // already formatted strings from server
  last_clicked_at: string | null;
  created_at: string;
};

type Props = { link: Link };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const code = ctx.params?.code;
  if (typeof code !== "string") {
    return { notFound: true };
  }

  const result = await query<any>(
    "SELECT code, url, total_clicks, last_clicked_at, created_at FROM links WHERE code = $1",
    [code]
  );

  if (result.rowCount === 0) {
    return { notFound: true };
  }

  const row = result.rows[0];

  const link: Link = {
    code: row.code,
    url: row.url,
    total_clicks: row.total_clicks,
    created_at: row.created_at
      ? new Date(row.created_at).toLocaleString("en-IN")
      : "",
    last_clicked_at: row.last_clicked_at
      ? new Date(row.last_clicked_at).toLocaleString("en-IN")
      : null,
  };

  return {
    props: {
      link,
    },
  };
};

export default function CodeStatsPage({ link }: Props) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const shortUrl = origin ? `${origin}/${link.code}` : `/${link.code}`;

  return (
    <>
      <Head>
        <title>Stats for {link.code} | TinyLink</title>
      </Head>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        {/* background */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-indigo-500/30 via-slate-950 to-slate-900" />
        <div className="fixed inset-0 -z-10 opacity-50 mix-blend-soft-light bg-[radial-gradient(circle_at_top,_#4f46e5_0,_transparent_60%),_radial-gradient(circle_at_bottom,_#0ea5e9_0,_transparent_55%)]" />

        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6 md:py-10">
          {/* HEADER */}
          <header className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => (window.location.href = "/")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/80 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800/80"
              >
                <span className="text-sm">←</span>
                Back to dashboard
              </button>
            </div>

            <div className="rounded-full border border-indigo-400/40 bg-slate-900/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-indigo-300">
              TinyLink • Stats
            </div>
          </header>

          {/* MAIN CARD */}
          <main className="mb-4 flex-1">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/60 backdrop-blur md:p-7">
              {/* top row: code + short url */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    Short code
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-slate-50 md:text-4xl">
                    {link.code}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-600/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 max-w-full md:max-w-md">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                    Short URL
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="truncate font-mono text-[11px]">
                      {shortUrl}
                    </span>
                    <button
                      type="button"
                      className={`rounded-lg border px-2 py-1 text-[11px] transition-all duration-200 active:scale-95 ${copied ? "bg-emerald-500/20 text-emerald-300 border-emerald-400" :
                          "border-slate-600/80 bg-slate-900/80 text-slate-100 hover:bg-slate-800/80"
                        }`}

                      onClick={() => {
                        navigator.clipboard?.writeText(shortUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>

                  </div>
                </div>
              </div>

              {/* metrics */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Total Clicks
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-sky-300">
                    {link.total_clicks}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Created
                  </div>
                  <div className="mt-2 text-xs text-slate-200">
                    {link.created_at}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Last Clicked
                  </div>
                  <div className="mt-2 text-xs text-slate-200">
                    {link.last_clicked_at ?? "Never"}
                  </div>
                </div>
              </div>

              {/* target URL */}
              <div className="mt-6">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Target URL
                </div>
                <div className="mt-2 rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3 text-xs text-slate-100">
                  <div className="line-clamp-3 break-all font-mono text-[11px]">
                    {link.url}
                  </div>
                </div>
              </div>

              {/* small hint */}
              <p className="mt-4 text-[11px] text-slate-500">
                Tip: Share the short URL above. Each visit will increase the
                total click count and update &ldquo;Last clicked&rdquo;.
              </p>
            </div>
          </main>

          <footer className="mt-3 border-t border-white/5 pt-3 text-[11px] text-slate-400">
            <div className="flex items-center justify-between gap-2">
              <span>
                TinyLink •{" "}
                <span className="text-slate-300">Analytics for {link.code}</span>
              </span>
              <a
                href="/"
                className="text-slate-300 underline-offset-2 hover:text-white hover:underline"
              >
                Back to dashboard
              </a>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
