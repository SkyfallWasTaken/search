import type { Stats, User } from "../types";
import { EmptyState } from "./components/EmptyState";
import { Header } from "./components/Header";
import { StatCard } from "./components/StatCard";
import { Table } from "./components/Table";
import { Layout } from "./layout";

type EndpointStats = Stats & { endpoint: string };

type GlobalProps = {
  user: User;
  globalStats: Stats;
  endpointStats: EndpointStats[];
};

export const Global = ({ user, globalStats, endpointStats }: GlobalProps) => {
  return (
    <Layout title="Global Statistics">
      <Header title="hacksearch stats" user={user} showBackToDashboard />

      <div class="w-full max-w-6xl mx-auto px-4 py-8">
        <h2 class="text-2xl font-bold mb-6 text-brand-heading">
          Global Usage Statistics (All Users)
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-6 mb-12">
          <StatCard
            value={globalStats.totalRequests?.toLocaleString() || 0}
            label="Total Requests"
          />
        </div>

        <h2 class="text-2xl font-bold mb-6 text-brand-heading">
          Usage by Endpoint
        </h2>
        {endpointStats.length === 0 ? (
          <EmptyState message="No usage data yet." />
        ) : (
          <Table
            columns={[
              {
                header: "Endpoint",
                render: (row) => (
                  <span class="font-medium">{row.endpoint || "Unknown"}</span>
                ),
              },
              {
                header: "Requests",
                render: (row) => row.totalRequests?.toLocaleString() || 0,
              },
            ]}
            data={endpointStats}
          />
        )}
      </div>
    </Layout>
  );
};
