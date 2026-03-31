import { TuyaContext } from "@tuya/tuya-connector-nodejs";
import { env } from "./environments";

export const tuyaContext = new TuyaContext({
  baseUrl: "https://openapi.tuyaus.com",
  accessKey: env.TUYA_CLIENT_ID,
  secretKey: env.TUYA_CLIENT_SECRET,
});
