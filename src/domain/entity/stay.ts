import type { Tenant } from './tenant';

export type Stay = {
  check_in: Date;
  check_out: Date;
  tenant: Tenant;
  guests: number;
  id: string;
  password: string;
};
