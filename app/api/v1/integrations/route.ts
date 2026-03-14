import { ok } from "@/lib/api/http";

export async function GET() {
  return ok({
    data: [
      {
        name: "Terminal Release Feed",
        status: "ready",
        description: "Maps paid invoices to terminal release workflows."
      },
      {
        name: "Carrier Milestone Feed",
        status: "ready",
        description: "Ingests transport events and updates shipment status."
      },
      {
        name: "Treasury FX Feed",
        status: "planned",
        description: "Refreshes exchange rates for multi-currency payment calculations."
      }
    ]
  });
}
