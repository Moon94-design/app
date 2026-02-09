import { loadJson, saveJson } from "./storage";
import { KEYS } from "./keys";
import type { Id, ListRepo } from "./repoTypes";

/**
 * LocalRepo: 지금 localStorage 기반 구현
 * - 나중에 ServerRepo로 동일 인터페이스를 구현하면 "갈아끼우기" 가능
 */
export class LocalRepo {
  // ---------- Generic helpers ----------
  private listRepo<T>(key: string, idField: keyof T & string = "id" as any): ListRepo<T> {
    return {
      getAll: () => loadJson<T[]>(key, [] as T[]),
      setAll: (list: T[]) => saveJson(key, list),
      prepend: (item: T) => {
        const list = loadJson<T[]>(key, [] as T[]);
        saveJson(key, [item, ...list]);
      },
      removeById: (id: Id) => {
        const list = loadJson<T[]>(key, [] as T[]);
        const next = list.filter((x: any) => String(x?.[idField]) !== String(id));
        saveJson(key, next);
      },
    };
  }

  // ---------- Masters ----------
  partners<T = any>() { return this.listRepo<T>(KEYS.partners); }
  partners_v2<T = any>() { return this.listRepo<T>(KEYS.partners_v2); } // ⚙️ Base + Extra 분리
  vehicles<T = any>() { return this.listRepo<T>(KEYS.vehicles); }
  vendors<T = any>() { return this.listRepo<T>(KEYS.vendors); }
  agencies<T = any>() { return this.listRepo<T>(KEYS.agencies); }
  employees<T = any>() { return this.listRepo<T>(KEYS.employees); }
  equipments<T = any>() { return this.listRepo<T>(KEYS.equipments); }
  consumables<T = any>() { return this.listRepo<T>(KEYS.consumables); }

  // ---------- Daily ----------
  logisticsLines<T = any>() { return this.listRepo<T>(KEYS.dailyLogisticsLines); }
  officeDaily<T = any>() { return this.listRepo<T>(KEYS.dailyOffice); }
  productionDaily<T = any>() { return this.listRepo<T>(KEYS.dailyProduction); }

  // ---------- Weighing (계량현황) ----------
  weighingTransactions<T = any>() { return this.listRepo<T>(KEYS.weighingTransactions); }

  // ---------- Events ----------
  priceEvents<T = any>() { return this.listRepo<T>(KEYS.priceEvents, "eventId" as any); }
  equipmentEvents<T = any>() { return this.listRepo<T>(KEYS.equipmentEvents, "eventId" as any); }

  // ---------- User/Local settings (개인 로컬 유지) ----------
  getAuthor(): string {
    return loadJson<string>(KEYS.author, "");
  }
  setAuthor(name: string) {
    saveJson(KEYS.author, name);
  }

  getShiftMemProduction<T = any>(): T {
    return loadJson<T>(KEYS.shiftMemProduction, {} as T);
  }
  setShiftMemProduction<T = any>(v: T) {
    saveJson(KEYS.shiftMemProduction, v);
  }
}
