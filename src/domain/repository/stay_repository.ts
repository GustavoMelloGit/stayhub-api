import type { Stay } from "../entity/stay";

export interface StayRepository {
  save(input: Omit<SaveStayDto, "id">): Promise<SaveStayDto>;
  findById(id: string): Promise<Stay | null>;
}

export type SaveStayDto = {
  id: string;
  tenant_id: string;
  check_in: Date;
  check_out: Date;
  guests: number;
  password: string;
};
