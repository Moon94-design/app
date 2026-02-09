// ORIGIN: copied from src/app/pages/register/RegisterEmployee.tsx (2026-02-09)
// SSOT: This file is the source of truth. Use via @kernel only.

export type EmployeeBranch = "대구" | "성주";

export type Employee = {
  id: string;
  name: string;
  branch: EmployeeBranch;
  phone: string;
  job: string;
  memo: string;
  createdAt: number;
  updatedAt: number;
};

export type EmployeeDraft = {
  name: string;
  branch: EmployeeBranch;
  phone: string;
  job: string;
  memo: string;
};

export function defaultEmployeeDraft(): EmployeeDraft {
  return {
    name: "",
    branch: "대구",
    phone: "",
    job: "",
    memo: "",
  };
}
