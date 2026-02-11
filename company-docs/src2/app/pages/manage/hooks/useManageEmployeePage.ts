import { useEffect, useMemo, useState } from "react";
import { createEmployeeRepo, type RepoContract } from "@kernel/repo";
import { formatPhoneInput } from "@kernel/utils";
import type { Employee } from "@kernel/schema/employee";

export function useManageEmployeePage() {
  const employeeRepo = useMemo(
    () => createEmployeeRepo() as unknown as RepoContract<Employee>,
    []
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    employeeRepo.getAll().then((items) => {
      if (!alive) return;
      setEmployees(items.sort((a, b) => b.updatedAt - a.updatedAt));
    });
    return () => {
      alive = false;
    };
  }, [employeeRepo]);

  const editingEmployee = useMemo(
    () => employees.find((employee) => employee.id === editingId) ?? null,
    [employees, editingId]
  );

  async function refresh() {
    const items = await employeeRepo.getAll();
    setEmployees(items.sort((a, b) => b.updatedAt - a.updatedAt));
  }

  async function saveEmployee(next: Employee) {
    await employeeRepo.upsert({
      ...next,
      name: next.name.trim(),
      phone: formatPhoneInput(next.phone),
      job: next.job.trim(),
      memo: next.memo.trim(),
      updatedAt: Date.now(),
    });
    await refresh();
    setEditingId(null);
  }

  async function removeEmployee(id: string) {
    await employeeRepo.remove(id);
    await refresh();
  }

  function startEdit(id: string) {
    setEditingId(id);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return {
    employees,
    editingEmployee,
    startEdit,
    cancelEdit,
    saveEmployee,
    removeEmployee,
  };
}
