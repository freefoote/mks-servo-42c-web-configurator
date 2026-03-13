// Generate a downlink packet
export function generateDownlinkPacket(
  slaveAddr: number,
  functionCode: number,
  data: number[] = [],
): number[] {
  const packet = [slaveAddr, functionCode, ...data];
  const crc = calculateCRC(packet);
  return [...packet, crc];
}

// Calculate 8-bit CRC (checksum)
export function calculateCRC(data: number[]): number {
  return data.reduce((sum, byte) => sum + byte, 0) & 0xff;
}

// Parse an uplink packet
export function parseUplinkPacket(packet: number[]): {
  slaveAddr: number;
  data: number[];
  valid: boolean;
} {
  if (packet.length < 3) {
    return { slaveAddr: 0, data: [], valid: false };
  }

  const slaveAddr = packet[0] as number;
  const data: number[] = packet.slice(0, -1); // All except last byte (CRC)
  const receivedCRC = packet[packet.length - 1] as number;
  const calculatedCRC: number = calculateCRC(data);

  return {
    slaveAddr,
    data: data.slice(1), // Remove slave addr from data
    valid: receivedCRC === calculatedCRC,
  };
}

// Read encoder value (command 0x30)
export function generateReadEncoderPacket(slaveAddr: number): number[] {
  return generateDownlinkPacket(slaveAddr, 0x30);
}

export function parseReadEncoderResponse(
  data: number[],
): { carry: number; value: number } | null {
  if (data.length < 6) {return null;}
  // Format: carry (int32_t) + value (uint16_t) + 2 extra bytes?
  // Based on example: e0 00 00 00 00 40 00 20
  // carry: bytes 0-3 (int32_t), value: bytes 4-5 (uint16_t)
  // Since we checked length >= 6, all indices are safe
  const b0 = data[0] as number;
  const b1 = data[1] as number;
  const b2 = data[2] as number;
  const b3 = data[3] as number;
  const b4 = data[4] as number;
  const b5 = data[5] as number;
  const carry = (b0 << 24) | (b1 << 16) | (b2 << 8) | b3;
  // Value is little-endian: bytes 4-5 where byte 4 is LSB, byte 5 is MSB
  const value = b4 | (b5 << 8);
  return { carry, value };
}

// Read pulses received (command 0x33)
export function generateReadPulsesPacket(slaveAddr: number): number[] {
  return generateDownlinkPacket(slaveAddr, 0x33);
}

export function parseReadPulsesResponse(data: number[]): number | null {
  if (data.length < 4) {return null;}
  // int32_t pulses
  // Since we checked length >= 4, all indices are safe
  const b0 = data[0] as number;
  const b1 = data[1] as number;
  const b2 = data[2] as number;
  const b3 = data[3] as number;
  return (b0 << 24) | (b1 << 16) | (b2 << 8) | b3;
}

// Read error (command 0x39)
export function generateReadErrorPacket(slaveAddr: number): number[] {
  return generateDownlinkPacket(slaveAddr, 0x39);
}

export function parseReadErrorResponse(data: number[]): number | null {
  if (data.length < 2) {return null;}
  // int16_t error, 0~FFFF corresponds to 0~360°
  // Since we checked length >= 2, all indices are safe
  const b0 = data[0] as number;
  const b1 = data[1] as number;
  const errorRaw = (b0 << 8) | b1;
  // Convert to degrees: errorRaw * 360 / 65536
  return (errorRaw * 360) / 65536;
}

// Calibrate encoder (command 0x80)
export function generateCalibratePacket(slaveAddr: number): number[] {
  return generateDownlinkPacket(slaveAddr, 0x80, [0x00]);
}

// Set motor type (command 0x81)
// type: 0 = 0.9°, 1 = 1.8°
export function generateSetMotorTypePacket(
  slaveAddr: number,
  type: 0 | 1,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0x81, [type]);
}

// Set work mode (command 0x82)
// mode: 0 = CR_OPEN, 1 = CR_vFOC, 2 = CR_UART
export function generateSetWorkModePacket(
  slaveAddr: number,
  mode: 0 | 1 | 2,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0x82, [mode]);
}

// Set current (command 0x83)
// ma: 0x00-0x0F, current = ma × 200 mA
export function generateSetCurrentPacket(
  slaveAddr: number,
  ma: number,
): number[] {
  if (ma < 0 || ma > 0x0f)
    {throw new Error("MA value must be between 0x00 and 0x0F");}
  return generateDownlinkPacket(slaveAddr, 0x83, [ma]);
}

// Set subdivision (command 0x84)
// micstep: 0x00-0xFF
export function generateSetSubdivisionPacket(
  slaveAddr: number,
  micstep: number,
): number[] {
  if (micstep < 0 || micstep > 0xff)
    {throw new Error("Micstep value must be between 0x00 and 0xFF");}
  return generateDownlinkPacket(slaveAddr, 0x84, [micstep]);
}

// Set EN pin active level (command 0x85)
// enable: 00=L, 01=H, 02=Hold
export function generateSetEnActivePacket(
  slaveAddr: number,
  enable: 0 | 1 | 2,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0x85, [enable]);
}

// Set direction (command 0x86)
// dir: 00=CW, 01=CCW
export function generateSetDirectionPacket(
  slaveAddr: number,
  dir: 0 | 1,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0x86, [dir]);
}

// Set auto screen off (command 0x87)
// enable: 00=disabled, 01=enabled
export function generateSetAutoSdpPacket(
  slaveAddr: number,
  enable: 0 | 1,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0x87, [enable]);
}

// Set protection (command 0x88)
// enable: 00=disabled, 01=enabled
export function generateSetProtectionPacket(
  slaveAddr: number,
  enable: 0 | 1,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0x88, [enable]);
}

// Set subdivision interpolation (command 0x89)
// enable: 00=disabled, 01=enabled
export function generateSetInterpolationPacket(
  slaveAddr: number,
  enable: 0 | 1,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0x89, [enable]);
}

// Set baud rate (command 0x8A)
// baud: 01=9600, 02=19200, 03=25000, 04=38400, 05=57600, 06=115200
export function generateSetBaudRatePacket(
  slaveAddr: number,
  baud: 1 | 2 | 3 | 4 | 5 | 6,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0x8a, [baud]);
}

// Set slave address (command 0x8B)
// addr: 00-09, slave address = addr + 0xe0
export function generateSetSlaveAddrPacket(
  slaveAddr: number,
  addr: number,
): number[] {
  if (addr < 0 || addr > 0x09)
    {throw new Error("Addr value must be between 0x00 and 0x09");}
  return generateDownlinkPacket(slaveAddr, 0x8b, [addr]);
}

// Restore default parameters (command 0x3F)
export function generateRestoreDefaultsPacket(slaveAddr: number): number[] {
  return generateDownlinkPacket(slaveAddr, 0x3f);
}

// Zero mode commands
// Set zero mode (command 0x90)
// mode: 00=Disable, 01=DirMode, 02=NearMode
export function generateSetZeroModePacket(
  slaveAddr: number,
  mode: 0 | 1 | 2,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0x90, [mode]);
}

// Set zero point (command 0x91)
export function generateSetZeroPointPacket(slaveAddr: number): number[] {
  return generateDownlinkPacket(slaveAddr, 0x91, [0x00]);
}

// Set zero speed (command 0x92)
// speed: 00-04 (smaller = faster)
export function generateSetZeroSpeedPacket(
  slaveAddr: number,
  speed: number,
): number[] {
  if (speed < 0 || speed > 0x04)
    {throw new Error("Speed value must be between 0x00 and 0x04");}
  return generateDownlinkPacket(slaveAddr, 0x92, [speed]);
}

// Set zero direction (command 0x93)
// dir: 00=CW, 01=CCW
export function generateSetZeroDirectionPacket(
  slaveAddr: number,
  dir: 0 | 1,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0x93, [dir]);
}

// Go to zero (command 0x94)
export function generateGoToZeroPacket(slaveAddr: number): number[] {
  return generateDownlinkPacket(slaveAddr, 0x94, [0x00]);
}

// PID/ACC/Torque commands
// Set position Kp (command 0xA1)
// Kp: uint16_t
export function generateSetKpPacket(slaveAddr: number, Kp: number): number[] {
  if (Kp < 0 || Kp > 0xffff)
    {throw new Error("Kp value must be between 0x0000 and 0xFFFF");}
  return generateDownlinkPacket(slaveAddr, 0xa1, [
    (Kp >> 8) & 0xff, // MSB
    Kp & 0xff, // LSB
  ]);
}

// Set position Ki (command 0xA2)
// Ki: uint16_t
export function generateSetKiPacket(slaveAddr: number, Ki: number): number[] {
  if (Ki < 0 || Ki > 0xffff)
    {throw new Error("Ki value must be between 0x0000 and 0xFFFF");}
  return generateDownlinkPacket(slaveAddr, 0xa2, [
    (Ki >> 8) & 0xff, // MSB
    Ki & 0xff, // LSB
  ]);
}

// Set position Kd (command 0xA3)
// Kd: uint16_t
export function generateSetKdPacket(slaveAddr: number, Kd: number): number[] {
  if (Kd < 0 || Kd > 0xffff)
    {throw new Error("Kd value must be between 0x0000 and 0xFFFF");}
  return generateDownlinkPacket(slaveAddr, 0xa3, [
    (Kd >> 8) & 0xff, // MSB
    Kd & 0xff, // LSB
  ]);
}

// Set acceleration (command 0xA4)
// ACC: uint16_t
export function generateSetAccPacket(slaveAddr: number, ACC: number): number[] {
  if (ACC < 0 || ACC > 0xffff)
    {throw new Error("ACC value must be between 0x0000 and 0xFFFF");}
  return generateDownlinkPacket(slaveAddr, 0xa4, [
    (ACC >> 8) & 0xff, // MSB
    ACC & 0xff, // LSB
  ]);
}

// Set maximum torque (command 0xA5)
// MaxT: 0x00-0x4B0
export function generateSetMaxTPacket(
  slaveAddr: number,
  MaxT: number,
): number[] {
  if (MaxT < 0 || MaxT > 0x4b0)
    {throw new Error("MaxT value must be between 0x0000 and 0x4B0");}
  return generateDownlinkPacket(slaveAddr, 0xa5, [
    (MaxT >> 8) & 0xff, // MSB
    MaxT & 0xff, // LSB
  ]);
}

// Serial control commands (require CR_UART mode)
// Set EN pin status (command 0xF3)
// en: 00=disable, 01=enable
export function generateSetEnStatusPacket(
  slaveAddr: number,
  en: 0 | 1,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0xf3, [en]);
}

// Run motor constant speed (command 0xF6)
// VAL: direction+speed (bit7=direction, bits0-6=speed)
// direction: 0=CW, 1=CCW
// speed: 0x00-0x7F (0-127)
export function generateRunConstantSpeedPacket(
  slaveAddr: number,
  direction: 0 | 1,
  speed: number,
): number[] {
  if (speed < 0 || speed > 0x7f)
    {throw new Error("Speed value must be between 0x00 and 0x7F");}
  const val = (direction << 7) | speed;
  return generateDownlinkPacket(slaveAddr, 0xf6, [val]);
}

// Stop motor (command 0xF7)
export function generateStopMotorPacket(slaveAddr: number): number[] {
  return generateDownlinkPacket(slaveAddr, 0xf7);
}

// Save/Clear status (command 0xFF)
// state: C8=Save, CA=Clear
export function generateSaveClearPacket(
  slaveAddr: number,
  state: 0xc8 | 0xca,
): number[] {
  return generateDownlinkPacket(slaveAddr, 0xff, [state]);
}

// Run motor by serial command (command 0xFD)
// VAL: direction+speed (same as F6)
// pulses: uint32_t number of pulses
export function generateRunSerialCommandPacket(
  slaveAddr: number,
  direction: 0 | 1,
  speed: number,
  pulses: number,
): number[] {
  if (speed < 0 || speed > 0x7f)
    {throw new Error("Speed value must be between 0x00 and 0x7F");}
  const val = (direction << 7) | speed;
  return generateDownlinkPacket(slaveAddr, 0xfd, [
    val,
    (pulses >> 24) & 0xff,
    (pulses >> 16) & 0xff,
    (pulses >> 8) & 0xff,
    pulses & 0xff,
  ]);
}
