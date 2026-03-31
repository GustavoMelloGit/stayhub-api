import type { TuyaContext } from "@tuya/tuya-connector-nodejs";
import type { DeviceManagementService } from "../../domain/service/device_management";
import { env } from "../../../core/infra/config/environments";
import type { Logger } from "../../../core/application/logger/logger";
import crypto from "crypto";

export class TuyaDeviceManagementService implements DeviceManagementService {
  constructor(
    private readonly tuyaContext: TuyaContext,
    private readonly logger: Logger
  ) {}

  #getDoorDevice(): string {
    return env.TUYA_DEVICE_ID;
  }

  async setTempPassword(
    password: string,
    name: string,
    startTime: Date,
    endTime: Date
  ): Promise<void> {
    try {
      const ticket = await this.tuyaContext.request<PasswordTicketResponse>({
        method: "POST",
        path: `/v1.0/devices/${this.#getDoorDevice()}/door-lock/password-ticket`,
        body: {
          effective_time: startTime,
          invalid_time: endTime,
        },
      });

      if (ticket.success === false) {
        throw new Error(ticket.msg ?? "Failed to get password ticket");
      }

      const originalKey = this.#decryptTicketKey(
        ticket.result.ticket_key,
        env.TUYA_CLIENT_SECRET
      );

      const encryptedPassword = this.#encryptPassword(password, originalKey);

      const createTempPasswordRequest: CreateTempPasswordRequest = {
        password: encryptedPassword,
        password_type: "ticket",
        time_zone: "America/Sao_Paulo",
        name,
        effective_time: startTime.getTime(),
        invalid_time: endTime.getTime(),
        ticket_id: ticket.result.ticket_id,
        schedule_list: [
          {
            effective_time: startTime.getTime(),
            invalid_time: endTime.getTime(),
            working_day: 0,
          },
        ],
        relate_dev_list: [this.#getDoorDevice()],
      };

      const tempPassword =
        await this.tuyaContext.request<CreateTempPasswordResponse>({
          method: "POST",
          path: `/v1.0/devices/${this.#getDoorDevice()}/door-lock/temp-password`,
          body: createTempPasswordRequest,
        });

      if (tempPassword.success === false) {
        throw new Error(tempPassword.msg ?? "Failed to set temp password");
      }
    } catch (error) {
      this.logger.error("Failed to set temp password", {
        error: error,
        password: password,
        name: name,
        startTime: startTime,
        endTime: endTime,
      });
    }
  }

  /**
   * Decrypts `ticket_key` from POST .../door-lock/password-ticket.
   * Tuya specifies **AES-256-ECB** + PKCS7 with the cloud **Access Secret**
   * (same value as API signing secret). The temp-password body then encrypts
   * the PIN with **AES-128-ECB** using this decrypted value as the key.
   *
   * @see https://developer.tuya.com/en/docs/cloud/doorlock-api-password
   */
  #decryptTicketKey(encryptedTicketKey: string, accessSecret: string): Buffer {
    const key = Buffer.from(accessSecret, "utf8");
    if (key.length !== 32) {
      throw new Error(
        "Tuya Access Secret must be 32 UTF-8 bytes for AES-256 ticket_key decryption"
      );
    }

    const decipher = crypto.createDecipheriv("aes-256-ecb", key, null);
    decipher.setAutoPadding(true);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedTicketKey, "hex")),
      decipher.final(),
    ]);

    return decrypted; // Este é o "Original Key"
  }

  #encryptPassword(password: string, originalKey: Buffer): string {
    // A Tuya exige AES-128-ECB com PKCS7Padding
    const cipher = crypto.createCipheriv("aes-128-ecb", originalKey, null);
    cipher.setAutoPadding(true);

    const encrypted = Buffer.concat([
      cipher.update(password, "utf8"),
      cipher.final(),
    ]);

    return encrypted.toString("hex").toUpperCase();
  }
}

type PasswordTicketResponse = {
  expire_time: number;
  ticket_id: string;
  ticket_key: string;
};

type CreateTempPasswordRequest = {
  password: string;
  password_type: "ticket";
  ticket_id: string;
  effective_time: number;
  invalid_time: number;
  name: string;
  /** If set, Tuya may send the password via SMS (requires SMS balance). */
  phone?: string;
  time_zone: string;
  schedule_list: [
    {
      effective_time: number;
      invalid_time: number;
      working_day: number;
    },
  ];
  relate_dev_list: string[];
};

type CreateTempPasswordResponse = {
  id: number;
};
