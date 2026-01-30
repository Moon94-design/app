import { LocalRepo } from "./localRepo";

/**
 * 현재는 로컬 구현을 기본 사용
 * - 나중에 서버 붙이면 여기서 ServerRepo로 교체하면 됨
 */
export const repo = new LocalRepo();
