export interface DeviceManagementService {
  setTempPassword(
    password: string,
    name: string,
    startTime: Date,
    endTime: Date
  ): Promise<void>;
}
