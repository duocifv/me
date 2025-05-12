import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import data from "./data.json";
import { Suspense } from "react";
import ErrorBoundary from "@/share/ErrorBoundary";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <Suspense>
              <ErrorBoundary>
                <DataTable data={data} />
              </ErrorBoundary>
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
