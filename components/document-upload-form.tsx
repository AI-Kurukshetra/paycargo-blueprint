"use client";

import { useState, type ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function DocumentUploadForm(): JSX.Element {
  const [status, setStatus] = useState<string | null>(null);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const path = `uploads/${Date.now()}-${file.name}`;

    setStatus("Uploading to Supabase Storage...");

    const { error } = await supabase.storage.from("documents").upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    const response = await fetch("/api/v1/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: file.name,
        document_type: "other",
        storage_bucket: "documents",
        storage_path: path,
        mime_type: file.type,
        size_bytes: file.size
      })
    });

    if (response.ok) {
      setStatus("Upload complete and document metadata saved.");
      window.location.reload();
    } else {
      setStatus("File uploaded, but metadata save failed.");
    }
  }

  return (
    <div className="surface p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-tide/10 p-3 text-tide">
          <UploadCloud className="h-5 w-5" />
        </div>
        <div>
          <p className="section-title">Storage Upload</p>
          <p className="mt-1 text-sm text-slate-500">Push a file to Supabase Storage and register it in the documents table.</p>
        </div>
      </div>
      <label className="mt-6 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm font-medium text-slate-600 transition hover:border-tide hover:text-ink">
        Select file
        <input type="file" className="hidden" onChange={(event) => void handleUpload(event)} />
      </label>
      {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
    </div>
  );
}
