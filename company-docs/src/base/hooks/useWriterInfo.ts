/**
 * useWriterInfo - 작성자 정보 관리 훅
 * 
 * 사용: 작성자명, 직책을 localStorage에 저장하고 자동 로드
 */
import { useCallback, useState } from "react";

const DEFAULT_WRITER_KEY = "common_writer_name";
const DEFAULT_ROLE_KEY = "common_writer_role";

type UseWriterInfoConfig = {
  writerKey?: string;
  roleKey?: string;
};

export function useWriterInfo(config: UseWriterInfoConfig = {}) {
  const { 
    writerKey = DEFAULT_WRITER_KEY, 
    roleKey = DEFAULT_ROLE_KEY 
  } = config;

  const [writerName, setWriterNameState] = useState(() => {
    try {
      return localStorage.getItem(writerKey) || "";
    } catch {
      return "";
    }
  });

  const [writerRole, setWriterRoleState] = useState(() => {
    try {
      return localStorage.getItem(roleKey) || "";
    } catch {
      return "";
    }
  });

  const setWriterName = useCallback((val: string) => {
    setWriterNameState(val);
    try {
      localStorage.setItem(writerKey, val);
    } catch {}
  }, [writerKey]);

  const setWriterRole = useCallback((val: string) => {
    setWriterRoleState(val);
    try {
      localStorage.setItem(roleKey, val);
    } catch {}
  }, [roleKey]);

  return {
    writerName,
    writerRole,
    setWriterName,
    setWriterRole,
  };
}
