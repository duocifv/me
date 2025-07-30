type DeviceName = "pump" | "fan" | "led" | "sensor" | "camera";

type DeviceState = {
  [key in DeviceName]: boolean;
};

export type LatestConfig = {
  [deviceId: string]: DeviceState;
};

export type ErrorsDto = {
  message: string | undefined;
  time: string;
  deviceId?: string;
};
