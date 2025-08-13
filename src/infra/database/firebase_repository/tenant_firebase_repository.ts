import {
  addDoc,
  and,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import type { Tenant } from "../../../domain/entity/tenant";
import type { TenantRepository } from "../../../domain/repository/tenant_repository";
import { db } from "../firebase";

export class TenantFirebaseRepository implements TenantRepository {
  async findById(id: string): Promise<Tenant | null> {
    const docRef = doc(db, "guests", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const docData = docSnap.data();

    return {
      id: docRef.id,
      name: docData.name,
      phone: docData.phone,
    } satisfies Tenant;
  }

  async save(input: { name: string; phone: string }): Promise<Tenant> {
    const tenant = {
      name: input.name,
      phone: input.phone,
    };
    const docRef = await addDoc(collection(db, "guests"), tenant);
    return {
      ...tenant,
      id: docRef.id,
    };
  }

  async isDuplicate(tenant: Tenant): Promise<boolean> {
    const q = query(
      collection(db, "guests"),
      and(where("name", "==", tenant.name), where("phone", "==", tenant.phone)),
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  async findAll(): Promise<Tenant[]> {
    const q = query(collection(db, "guests"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();

      const tenant: Tenant = {
        id: doc.id,
        name: data.name,
        phone: data.phone,
      };

      return tenant;
    });
  }
}
