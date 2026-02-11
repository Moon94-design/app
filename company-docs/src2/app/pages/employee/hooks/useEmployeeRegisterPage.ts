import { useCallback, useEffect, useMemo, useState } from "react";
import { DRAFT_KEYS, useDraft } from "@kernel/draft";
import { createEmployeeRepo, type RepoContract } from "@kernel/repo";
import { createLocalId, formatPhoneInput } from "@kernel/utils";
import {
  defaultEmployeeDraft,
  type Employee,
  type EmployeeBranch,
  type EmployeeDraft,
} from "@kernel/schema/employee";

function newId() {
  return createLocalId("E");
}

export function useEmployeeRegisterPage() {
  const employeeRepo = useMemo(
    () => createEmployeeRepo() as unknown as RepoContract<Employee>,
    []
  );

  const [employees, setEmployees] = useState<Employee[]>([]);

  const { draft, setDraft, saveDraft, discardDraft } = useDraft<EmployeeDraft>({
    key: DRAFT_KEYS.employeeRegister,
    initial: defaultEmployeeDraft(),
  });

  useEffect(() => {
    let alive = true;
    employeeRepo.getAll().then((items) => {
      if (alive) setEmployees(items);
    });
    return () => {
      alive = false;
    };
  }, [employeeRepo]);

  const updateDraft = useCallback(
    (patch: Partial<EmployeeDraft>) => {
      const next = { ...draft, ...patch };
      setDraft(next);
      saveDraft(next);
    },
    [draft, saveDraft, setDraft]
  );

  const updateBranch = useCallback(
    (branch: EmployeeBranch) => {
      updateDraft({ branch });
    },
    [updateDraft]
  );

  const updatePhone = useCallback(
    (raw: string) => {
      updateDraft({ phone: formatPhoneInput(raw) });
    },
    [updateDraft]
  );

  const resetDraft = useCallback(() => {
    discardDraft();
  }, [discardDraft]);

  const submit = useCallback(async () => {
    if (!draft.name.trim()) {
      alert("이름을 입력하세요.");
      return;
    }
    if (!draft.phone.trim()) {
      alert("연락처를 입력하세요.");
      return;
    }
    if (!draft.job.trim()) {
      alert("직무를 입력하세요.");
      return;
    }

    const now = Date.now();
    const nextEmployee: Employee = {
      id: newId(),
      name: draft.name.trim(),
      branch: draft.branch,
      phone: draft.phone.trim(),
      job: draft.job.trim(),
      memo: draft.memo.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await employeeRepo.upsert(nextEmployee);
    setEmployees(await employeeRepo.getAll());
    discardDraft();
    alert("저장되었습니다.(로컬)");
  }, [discardDraft, draft, employeeRepo]);

  const removeEmployee = useCallback(
    async (id: string) => {
      await employeeRepo.remove(id);
      setEmployees(await employeeRepo.getAll());
    },
    [employeeRepo]
  );

  return {
    draft,
    employees,
    updateDraft,
    updateBranch,
    updatePhone,
    resetDraft,
    submit,
    removeEmployee,
  };
}
