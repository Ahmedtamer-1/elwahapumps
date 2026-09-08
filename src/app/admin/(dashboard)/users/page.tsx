import React from "react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Badge, Card, PageHeader, SubmitButton } from "@/components/admin/ui";
import NewUserForm from "@/components/admin/NewUserForm";
import { formatDate } from "@/lib/format";
import { deleteUser } from "@/lib/actions/users";

export const metadata = { title: "Staff" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const admin = await requireAdmin();

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <PageHeader title="Staff accounts" subtitle="Who can sign in to this dashboard." />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card title="Team" className="lg:col-span-3 overflow-hidden">
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-stone uppercase border-b border-rule">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3 hidden sm:table-cell text-right">Added</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-rule-light">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-ink">{u.name}</p>
                      <p className="text-xs text-stone break-all">{u.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        label={u.role}
                        className={
                          u.role === "ADMIN"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-bone text-stone border-rule"
                        }
                      />
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-right text-xs text-stone tabular-nums whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.id === admin.userId ? (
                        <span className="text-xs text-stone-light">You</span>
                      ) : (
                        <form action={deleteUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <SubmitButton type="submit" variant="danger" className="text-xs px-3 py-1.5">
                            Remove
                          </SubmitButton>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Add a staff member" className="lg:col-span-2">
          <NewUserForm />
        </Card>
      </div>
    </>
  );
}
