/**
 * repo 타입은 "최소 공통"만 둔다.
 * - 각 페이지에서 가진 타입과 구조가 달라도(구조적 타이핑) 문제 없음
 * - 서버 이식 시에도 이 타입들을 기준으로 정리 가능
 */
export type Id = string;

export type ListRepo<T> = {
  getAll(): T[];
  setAll(list: T[]): void;
  prepend(item: T): void;
  removeById(id: Id): void;
};
