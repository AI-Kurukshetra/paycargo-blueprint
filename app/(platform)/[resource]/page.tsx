import { notFound } from "next/navigation";
import { DocumentUploadForm } from "@/components/document-upload-form";
import { ResourceWorkspace } from "@/components/resource-workspace";
import { resourceViewConfigs } from "@/lib/domain/resource-views";

export default function ResourcePage({
  params
}: {
  params: { resource: string };
}): JSX.Element {
  const config = resourceViewConfigs[params.resource];

  if (!config) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {params.resource === "documents" ? <DocumentUploadForm /> : null}
      <ResourceWorkspace config={config} />
    </div>
  );
}
