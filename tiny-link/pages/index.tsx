import Head from "next/head";
import React, { useEffect, useState } from "react";

type Link = {
  code: string;
  url: string;
  total_clicks: number;
  last_clicked_at: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // duplicate handling
  const [duplicateLink, setDuplicateLink] = useState<Link | null>(null);
  const [duplicatePending, setDuplicatePending] = useState<
    { url: string; code?: string } | null
  >(null);

  async function loadLinks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("Failed to load links");
      const data = await res.json();
      setLinks(data);
    } catch (e: any) {
      setError(e.message || "Error loading links");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  // Helper: create link with optional duplicate skipping
  async function createLink(
    payload: { url: string; code?: string },
    skipDuplicateCheck: boolean = false
  ) {
    const trimmedUrl = payload.url.trim();
    const trimmedCode = payload.code?.trim() || undefined;

    if (!skipDuplicateCheck) {
      // check if this URL is already shortened
      const existing = links.find(
        (l) => l.url.trim() === trimmedUrl
      );
      if (existing) {
        setDuplicateLink(existing);
        setDuplicatePending({ url: trimmedUrl, code: trimmedCode });
        setError(null);
        setSuccess(null);
        setFormLoading(false);
        return;
      }
    }

    setFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl, code: trimmedCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create link");
        return;
      }

      setSuccess("Link created successfully");
      setUrl("");
      setCode("");
      setDuplicateLink(null);
      setDuplicatePending(null);
      await loadLinks();
    } catch (e: any) {
      setError(e.message || "Error creating link");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    await createLink({ url, code: code || undefined });
  }

  async function handleDelete(code: string) {
    if (!confirm(`Delete link ${code}?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/links/${code}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).error || "Failed to delete");
      }
      await loadLinks();
    } catch (e: any) {
      setError(e.message || "Error deleting link");
    }
  }

  const filtered = links.filter((l) => {
    const term = search.toLowerCase();
    return (
      l.code.toLowerCase().includes(term) ||
      l.url.toLowerCase().includes(term)
    );
  });

  function copyUrl(code: string) {
    if (typeof window === "undefined") return;
    const shortUrl = `${window.location.origin}/${code}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shortUrl);
    } else {
      const el = document.createElement("textarea");
      el.value = shortUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  }

  // simple stats
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, l) => sum + l.total_clicks, 0);
  const mostClicked =
    links.length === 0
      ? null
      : links.reduce((top, l) =>
        !top || l.total_clicks > top.total_clicks ? l : top,
      );

  return (
    <>
      <Head>
        <title>TinyLink Dashboard</title>
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-50">
        {/* nice gradient background */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-indigo-500/30 via-slate-950 to-slate-900" />
        <div className="fixed inset-0 -z-10 opacity-50 mix-blend-soft-light bg-[radial-gradient(circle_at_top,_#4f46e5_0,_transparent_60%),_radial-gradient(circle_at_bottom,_#0ea5e9_0,_transparent_55%)]" />

        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:py-10">
          {/* HEADER */}
          <header className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-indigo-400/40 bg-slate-900/70 px-3 py-1 shadow-sm shadow-indigo-500/40">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/90 text-xs font-bold text-white">
                  TL
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                    TinyLink
                  </span>
                  <span className="text-[11px] text-slate-300/90">
                    Minimal URL shortener 
                  </span>
                </div>
              </div>
              <span className="hidden text-xs text-slate-400 md:inline">
                Manage your short links, track clicks &amp; view stats.
              </span>
            </div>

            <a
              href="/healthz"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 shadow-sm shadow-emerald-500/40 hover:bg-emerald-500/20"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.5)]" />
              Healthcheck
            </a>
          </header>

          {/* MAIN CARD */}
          <main className="mb-4 flex-1">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/60 backdrop-blur md:p-7">
              {/* top layout: left intro + form */}
              <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-8">
                {/* LEFT: overview + stats */}
                <section className="space-y-4">
                  <div>
                    <h1 className="text-xl font-semibold text-slate-50 md:text-2xl">
                      Welcome to TinyLink 👋
                    </h1>
                    <p className="mt-1 text-sm text-slate-300/90">
                      Create branded short URLs in seconds. Track performance
                      and clean up old links from a single, focused dashboard.
                    </p>
                  </div>

                  {/* tiny stats bar */}
                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Total Links
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-slate-50">
                        {totalLinks}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Total Clicks
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-sky-300">
                        {totalClicks}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Most Clicked
                      </div>
                      <div className="mt-1 text-xs text-slate-200">
                        {mostClicked ? (
                          <>
                            <span className="font-mono text-[11px] rounded-md bg-slate-800/80 px-1.5 py-0.5">
                              {mostClicked.code}
                            </span>
                            <span className="ml-2 text-sky-300">
                              {mostClicked.total_clicks} clicks
                            </span>
                          </>
                        ) : (
                          "No data yet"
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* RIGHT: create form */}
                <section className="rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-lg shadow-black/40 md:p-5">
                  <h2 className="mb-3 text-sm font-semibold text-slate-100">
                    Create a new short link
                  </h2>
                  <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">
                        Target URL
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        className="input bg-slate-950/60 text-slate-50 placeholder:text-slate-500"
                        placeholder="https://example.com/very/long/url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">
                        Custom code{" "}
                        <span className="text-[11px] font-normal text-slate-400">
                          (optional)
                        </span>
                      </label>
                      <input
                        className="input bg-slate-950/60 text-slate-50 placeholder:text-slate-500"
                        placeholder="mydocs (6–8 alphanumeric)"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        maxLength={8}
                      />
                      <p className="text-[11px] text-slate-400">
                        Must match <code>[A-Za-z0-9]&#123;6,8&#125;</code>. Leave
                        empty to auto-generate.
                      </p>
                    </div>

                    <button
                      className="btn-primary mt-2 w-full justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/40 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                      type="submit"
                      disabled={formLoading}
                    >
                      {formLoading ? "Creating..." : "Shorten URL"}
                    </button>
                  </form>

                  {/* Inline messages */}
                  <div className="mt-3 space-y-2">
                    {error && (
                      <p className="text-xs text-red-200 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}
                    {success && (
                      <p className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-500/40 rounded-lg px-3 py-2">
                        {success}
                      </p>
                    )}
                  </div>

                  {/* Duplicate URL prompt */}
                  {duplicateLink && (
                    <div className="mt-3 rounded-xl border border-amber-400/50 bg-amber-500/10 px-3 py-3 text-xs text-amber-100">
                      <div className="font-semibold text-amber-200">
                        This URL is already shortened
                      </div>
                      <p className="mt-1 text-[11px] text-amber-100/90">
                        You&apos;ve shortened this URL before. You can reuse the
                        existing short link or create a new one anyway.
                      </p>

                      <div className="mt-2 rounded-lg bg-slate-950/60 px-2 py-2 text-[11px]">
                        <div className="text-slate-300">
                          <span className="text-slate-400">Code:</span>{" "}
                          <span className="font-mono">{duplicateLink.code}</span>
                        </div>
                        <div className="mt-1 text-slate-300">
                          <span className="text-slate-400">URL:</span>{" "}
                          <span className="break-all">{duplicateLink.url}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-100 hover:bg-emerald-500/20"
                          onClick={() => {
                            // Copy existing short URL & clear prompt
                            copyUrl(duplicateLink.code);
                            setSuccess(
                              "Existing short link copied to clipboard."
                            );
                            setDuplicateLink(null);
                            setDuplicatePending(null);
                          }}
                        >
                          Use existing link
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center rounded-lg border border-amber-400/60 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-100 hover:bg-amber-500/20"
                          onClick={() => {
                            if (duplicatePending) {
                              createLink(duplicatePending, true);
                            }
                          }}
                        >
                          Shorten anyway
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center rounded-lg border border-slate-600/70 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800/80"
                          onClick={() => {
                            setDuplicateLink(null);
                            setDuplicatePending(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* divider */}
              <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-700/70 to-transparent" />

              {/* LINKS TABLE */}
              <section>
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                      Your links
                    </h2>
                    <p className="text-xs text-slate-400">
                      Click a code to view detailed stats, or copy / delete
                      individual links.
                    </p>
                  </div>
                  <input
                    className="input md:max-w-xs bg-slate-950/60 text-slate-50 placeholder:text-slate-500"
                    placeholder="Search by code or URL"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 shadow-inner shadow-black/40">
                  {loading ? (
                    <div className="px-4 py-6 text-sm text-slate-300">
                      Loading links…
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-slate-300">
                      No links found. Create your first short link above.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table text-slate-100/90">
                        <thead className="bg-slate-900/80">
                          <tr>
                            <th className="text-[11px]">Code</th>
                            <th className="text-[11px]">Target URL</th>
                            <th className="text-[11px]">Clicks</th>
                            <th className="text-[11px]">Last clicked</th>
                            <th className="text-[11px] text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((link) => (
                            <tr
                              key={link.code}
                              className="hover:bg-slate-900/70 transition-colors"
                            >
                              <td className="font-mono text-[11px]">
                                <a
                                  href={`/code/${link.code}`}
                                  className="rounded-md bg-slate-900/80 px-2 py-1 text-indigo-200 underline-offset-2 hover:text-indigo-100 hover:underline"
                                >
                                  {link.code}
                                </a>
                              </td>
                              <td className="max-w-xs">
                                <div
                                  className="text-xs md:text-sm truncate text-slate-200"
                                  title={link.url}
                                >
                                  {link.url}
                                </div>
                              </td>
                              <td className="text-sm text-sky-300">
                                {link.total_clicks}
                              </td>
                              <td className="text-[11px] text-slate-300">
                                {link.last_clicked_at ?? "Never"}
                              </td>
                              <td>
                                <div className="flex justify-end gap-2 text-xs">
                                  <button
                                    className={`btn border-slate-600/70 px-2 py-1 text-[11px] transition-all duration-200 ${copiedCode === link.code
                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400"
                                        : "bg-slate-900 text-slate-700 hover:bg-slate-800/90 hover:text-slate-200"
                                      }`}
                                    type="button"
                                    onClick={() => copyUrl(link.code)}
                                  >
                                    {copiedCode === link.code
                                      ? "Copied!"
                                      : "Copy"}
                                  </button>
                                  <button
                                    className="btn text-xs text-red-500 border-red-500/40 bg-red-500/10 px-2 py-1 hover:bg-red-500 hover:text-red-200"
                                    type="button"
                                    onClick={() => handleDelete(link.code)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </main>

          {/* FOOTER */}
          <footer className="mt-3 border-t border-white/5 pt-3 text-[11px] text-slate-400">
            <div className="flex items-center justify-between gap-2">
              <span>
                TinyLink • <span className="text-slate-300">URL shortener</span>
              </span>
              <span className="text-slate-500">Assignment build</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
