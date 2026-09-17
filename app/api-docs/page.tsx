"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, ArrowLeft, Key, PlayCircle, ExternalLink } from "lucide-react";

export default function ApiDocsPage() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Inject Swagger UI CSS
    const linkId = "swagger-ui-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css";
      document.head.appendChild(link);
    }

    // Inject Swagger UI bundle JS
    const scriptId = "swagger-ui-bundle";
    const standaloneId = "swagger-ui-standalone";

    const loadScripts = () => {
      const initSwagger = () => {
        if ((window as any).SwaggerUIBundle) {
          (window as any).SwaggerUIBundle({
            url: "/api/openapi.json",
            dom_id: "#swagger-ui",
            deepLinking: true,
            presets: [
              (window as any).SwaggerUIBundle.presets.apis,
              (window as any).SwaggerUIStandalonePreset,
            ],
            layout: "BaseLayout",
            docExpansion: "list",
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
            displayRequestDuration: true,
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
            tryItOutEnabled: true,
          });
          setLoading(false);
        }
      };

      if ((window as any).SwaggerUIBundle) {
        initSwagger();
        return;
      }

      const script1 = document.createElement("script");
      script1.id = scriptId;
      script1.src = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js";
      script1.crossOrigin = "anonymous";
      script1.onload = () => {
        const script2 = document.createElement("script");
        script2.id = standaloneId;
        script2.src = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js";
        script2.crossOrigin = "anonymous";
        script2.onload = () => initSwagger();
        document.body.appendChild(script2);
      };
      document.body.appendChild(script1);
    };

    loadScripts();

    // Check if user has active session
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          // Fetch demo token from login or inform user
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@leadpilot.internal",
          password: "AdminPassword123!",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          navigator.clipboard.writeText(data.token);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header Banner */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight leading-tight flex items-center gap-2">
                  LeadPilot AI <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-medium border border-indigo-500/30">API Docs</span>
                </h1>
                <p className="text-[11px] text-slate-400">OpenAPI 3.0 Interactive Test Console</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <a
              href="/api/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              Raw OpenAPI JSON
            </a>
            <button
              onClick={handleQuickLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/20 transition"
            >
              <Key className="w-3.5 h-3.5" />
              {copied ? "Token Copied to Clipboard!" : "Get & Copy Test Token"}
            </button>
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
            >
              <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
              Properties UI
            </Link>
          </div>
        </div>

        {/* Quick Testing Instructions Tip */}
        <div className="bg-indigo-950/70 border-t border-indigo-900/60 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Testing Tip:</strong> To execute protected endpoints, click <strong>Authorize</strong> 🔓 and paste your token, or click <strong>&quot;Get &amp; Copy Test Token&quot;</strong> above!
              </span>
            </div>
            <div className="text-[11px] text-indigo-300 font-mono">
              TNREGINET Gov Automation: <code>/api/properties/&#123;id&#125;/legal/fetch-govt-docs</code>
            </div>
          </div>
        </div>
      </header>

      {/* Main Swagger Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold">Loading Swagger UI interactive console...</p>
            <p className="text-xs text-slate-400 mt-1">Parsing OpenAPI 3.0 specification from /api/openapi.json</p>
          </div>
        )}

        <div
          id="swagger-ui"
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden"
        />
      </main>

      <style jsx global>{`
        /* Swagger UI custom enhancements */
        .swagger-ui .topbar {
          display: none !important;
        }
        .swagger-ui {
          font-family: inherit !important;
        }
        .swagger-ui .info {
          margin-bottom: 24px !important;
        }
        .swagger-ui .info .title {
          font-size: 24px !important;
          color: #0f172a !important;
          font-weight: 800 !important;
        }
        .swagger-ui .scheme-container {
          background: #f8fafc !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: none !important;
        }
        .swagger-ui .btn.authorize {
          color: #4f46e5 !important;
          border-color: #4f46e5 !important;
          border-radius: 6px !important;
          font-weight: 600 !important;
        }
        .swagger-ui .btn.authorize svg {
          fill: #4f46e5 !important;
        }
        .swagger-ui .opblock {
          border-radius: 8px !important;
          margin-bottom: 12px !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        }
        .swagger-ui .opblock.opblock-post {
          background: rgba(79, 70, 229, 0.04) !important;
          border-color: #6366f1 !important;
        }
        .swagger-ui .opblock.opblock-post .opblock-summary-method {
          background: #4f46e5 !important;
          border-radius: 6px !important;
        }
        .swagger-ui .opblock.opblock-get {
          background: rgba(16, 185, 129, 0.04) !important;
          border-color: #10b981 !important;
        }
        .swagger-ui .opblock.opblock-get .opblock-summary-method {
          background: #059669 !important;
          border-radius: 6px !important;
        }
        .swagger-ui .opblock.opblock-delete {
          background: rgba(239, 68, 68, 0.04) !important;
          border-color: #ef4444 !important;
        }
        .swagger-ui .opblock.opblock-delete .opblock-summary-method {
          background: #dc2626 !important;
          border-radius: 6px !important;
        }
      `}</style>
    </div>
  );
}

