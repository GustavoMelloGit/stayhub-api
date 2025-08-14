import { eq } from "drizzle-orm";
import { Stay } from "../../../domain/entity/stay";
import { Tenant } from "../../../domain/entity/tenant";
import type {
  SaveStayDto,
  StayRepository,
} from "../../../domain/repository/stay_repository";
import { db } from "../drizzle/database";
import { staysTable } from "../drizzle/schema";

export class StayPostgresRepository implements StayRepository {
  async save(input: Omit<SaveStayDto, "id">): Promise<SaveStayDto> {
    const entity = Stay.create(input);

    const stay = await db
      .insert(staysTable)
      .values({
        check_in: entity.check_in,
        check_out: entity.check_out,
        guests: entity.guests,
        password: entity.password,
        tenant_id: entity.tenant_id,
      })
      .returning();

    if (!stay[0]) {
      throw new Error("Failed to save stay");
    }

    return stay[0];
  }

  async findById(id: string): Promise<Stay | null> {
    const stay = await db.query.staysTable.findFirst({
      where: eq(staysTable.id, id),
      with: {
        tenant: true,
      },
    });

    if (!stay) {
      return null;
    }

    const tenant = Tenant.reconstitute(stay.tenant);

    return Stay.reconstitute({
      ...stay,
      tenant,
      id: stay.id,
    });
  }
}
