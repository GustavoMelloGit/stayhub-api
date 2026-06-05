import { Property } from "../../../src/property_management/domain/entity/property";
import { PropertyPostgresRepository } from "../../../src/property_management/infra/database/postgres_repository/property_postgres_repository";

export async function createPropertyFixture(input: {
  userId: string;
  name?: string;
  capacity?: number;
}): Promise<Property> {
  const entity = Property.create({
    name: input.name ?? "Test Property",
    user_id: input.userId,
    capacity: input.capacity ?? 4,
    images: ["https://example.com/image.jpg"],
    address: {
      street: "Rua das Flores",
      number: "123",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zip_code: "01310-100",
      country: "Brasil",
      complement: "",
    },
  });

  const repository = new PropertyPostgresRepository();
  await repository.save(entity);

  return entity;
}
