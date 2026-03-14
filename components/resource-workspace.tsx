"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { ResourceViewConfig } from "@/lib/domain/resource-views";
import { cn, formatDate } from "@/lib/utils";

type ResourceRecord = Record<string, unknown> & { id: string };
type SelectOptions = Record<string, Array<{ label: string; value: string }>>;

function coerceValue(type: ResourceViewConfig["fields"][number]["type"], value: FormDataEntryValue | null) {
  if (type === "number") {
    return value ? Number(value) : 0;
  }

  if (type === "checkbox") {
    return value === "on";
  }

  return value ? String(value) : "";
}

export function ResourceWorkspace({ config }: { config: ResourceViewConfig }): JSX.Element {
  const [records, setRecords] = useState<ResourceRecord[]>([]);
  const [draft, setDraft] = useState<ResourceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectOptions, setSelectOptions] = useState<SelectOptions>({});

  async function loadRecords() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(config.apiPath, { cache: "no-store" });
      const payload = (await response.json()) as { data?: ResourceRecord[]; error?: { message?: string } };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to load records.");
      }

      setRecords(payload.data ?? []);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, [config.apiPath]);

  useEffect(() => {
    async function loadFieldOptions() {
      const fieldsWithSources = config.fields.filter((field) => field.source);

      const entries = await Promise.all(
        fieldsWithSources.map(async (field) => {
          const response = await fetch(field.source as string, { cache: "no-store" });
          const payload = (await response.json()) as { data?: ResourceRecord[] };
          const options = (payload.data ?? []).map((record) => ({
            label: String(record[field.sourceLabelKey ?? "id"] ?? record.id),
            value: String(record[field.sourceValueKey ?? "id"] ?? record.id)
          }));

          return [field.name, options] as const;
        })
      );

      setSelectOptions(Object.fromEntries(entries));
    }

    void loadFieldOptions();
  }, [config.fields]);

  const mode = useMemo(() => (draft ? "edit" : "create"), [draft]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = config.fields.reduce<Record<string, unknown>>((accumulator, field) => {
      const rawValue = formData.get(field.name);
      const coerced = coerceValue(field.type, rawValue);
      if (coerced !== "") {
        accumulator[field.name] = coerced;
      }
      return accumulator;
    }, {});

    try {
      const response = await fetch(draft ? `${config.apiPath}/${draft.id}` : config.apiPath, {
        method: draft ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseBody = response.status === 204 ? null : ((await response.json()) as { error?: { message?: string } });
      if (!response.ok) {
        throw new Error(responseBody?.error?.message ?? "Request failed.");
      }

      event.currentTarget.reset();
      setDraft(null);
      await loadRecords();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save record.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this record?");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`${config.apiPath}/${id}`, { method: "DELETE" });
    if (response.ok) {
      await loadRecords();
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
      <section className="surface overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="section-title">{config.title}</p>
          <p className="mt-2 text-sm text-slate-500">{config.description}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50/70">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key} className="px-6 py-3 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs uppercase tracking-[0.24em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="px-6 py-8 text-center text-sm text-slate-500">
                    Loading {config.title.toLowerCase()}...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="px-6 py-8 text-center text-sm text-slate-500">
                    No records yet.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-t border-slate-100">
                    {config.columns.map((column) => {
                      const value = record[column.key];
                      return (
                        <td key={column.key} className="px-6 py-4 text-sm text-slate-700">
                          {typeof value === "string" && (value.includes("pending") || value.includes("active") || value.includes("paid") || value.includes("released") || value.includes("failed") || value.includes("approved")) ? (
                            <StatusBadge value={value} />
                          ) : typeof value === "string" && value.includes("T") ? (
                            formatDate(value)
                          ) : (
                            String(value ?? "—")
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDraft(record)}
                          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:text-ink"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(record.id)}
                          className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:border-rose-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-title">{mode === "edit" ? "Update record" : "Create record"}</p>
            <p className="mt-2 text-sm text-slate-500">
              {mode === "edit" ? "Make a targeted update and save it back to the API." : "Add a new record to this resource group."}
            </p>
          </div>
          {draft ? (
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600"
            >
              New
            </button>
          ) : (
            <div className="rounded-full bg-tide/10 p-2 text-tide">
              <Plus className="h-4 w-4" />
            </div>
          )}
        </div>

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          {config.fields.map((field) => {
            const defaultValue = draft ? String(draft[field.name] ?? "") : "";
            const options = field.options ?? selectOptions[field.name] ?? [];

            return (
              <label key={field.name} className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{field.label}</span>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    defaultValue={defaultValue}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-tide"
                  >
                    <option value="">Select...</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    defaultValue={defaultValue}
                    placeholder={field.placeholder}
                    className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-tide"
                  />
                ) : (
                  <input
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    defaultValue={defaultValue}
                    placeholder={field.placeholder}
                    className={cn(
                      "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-tide",
                      field.type === "checkbox" && "h-5 w-5 rounded-md"
                    )}
                  />
                )}
              </label>
            );
          })}

          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : draft ? "Save changes" : "Create record"}
          </button>
        </form>
      </section>
    </div>
  );
}
