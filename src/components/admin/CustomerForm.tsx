import React from "react";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";
import { saveCustomer } from "@/lib/actions/crm";

export interface CustomerFormValues {
  id?: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export default function CustomerForm({ customer }: { customer?: CustomerFormValues }) {
  return (
    <form action={saveCustomer} className="space-y-4">
      {customer?.id && <input type="hidden" name="id" value={customer.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name">
          <input name="name" required defaultValue={customer?.name ?? ""} className={inputClass} />
        </Field>
        <Field label="Company">
          <input name="company" defaultValue={customer?.company ?? ""} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" defaultValue={customer?.phone ?? ""} className={inputClass} />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            defaultValue={customer?.email ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Address">
        <textarea
          name="address"
          rows={2}
          defaultValue={customer?.address ?? ""}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <SubmitButton type="submit">{customer?.id ? "Save changes" : "Create customer"}</SubmitButton>
    </form>
  );
}
