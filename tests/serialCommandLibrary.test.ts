import { describe, it, expect } from "vitest";
import {
  generateDownlinkPacket,
  calculateCRC,
  parseUplinkPacket,
  generateReadEncoderPacket,
  parseReadEncoderResponse,
  generateSetCurrentPacket,
} from "../src/lib/serialCommand";

describe("generateDownlinkPacket", () => {
  it("should generate correct packet with no data", () => {
    const packet = generateDownlinkPacket(0xe0, 0x30);
    expect(packet).toEqual([0xe0, 0x30, 0x10]); // E0+30=110 -> 0x10
  });

  it("should generate correct packet with data", () => {
    const packet = generateDownlinkPacket(0xe0, 0x81, [0x01]);
    expect(packet).toEqual([0xe0, 0x81, 0x01, 0x62]); // E0+81+01=162 -> 0xA2
  });
});

describe("calculateCRC", () => {
  it("should calculate correct CRC", () => {
    expect(calculateCRC([0xe0, 0x30])).toBe(0x10);
    expect(calculateCRC([0xe0, 0x80, 0x00])).toBe(0x60);
  });
});

describe("parseUplinkPacket", () => {
  it("should parse valid packet correctly", () => {
    const packet = [0xe0, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x20];
    const result = parseUplinkPacket(packet);
    expect(result.valid).toBe(true);
    expect(result.slaveAddr).toBe(0xe0);
    expect(result.data).toEqual([0x00, 0x00, 0x00, 0x00, 0x40, 0x00]);
  });

  it("should detect invalid CRC", () => {
    const packet = [0xe0, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x21]; // Wrong CRC
    const result = parseUplinkPacket(packet);
    expect(result.valid).toBe(false);
  });
});

describe("generateReadEncoderPacket", () => {
  it("should generate correct packet", () => {
    const packet = generateReadEncoderPacket(0xe0);
    expect(packet).toEqual([0xe0, 0x30, 0x10]);
  });
});

describe("parseReadEncoderResponse", () => {
  it("should parse encoder response correctly", () => {
    // Example from manual: e0 00 00 00 00 40 00 20
    // carry: 0x00000000 = 0
    // value: 0x0040 = 64
    const data = [0x00, 0x00, 0x00, 0x00, 0x40, 0x00];
    const result = parseReadEncoderResponse(data);
    expect(result).toEqual({ carry: 0, value: 64 });
  });

  it("should handle negative carry", () => {
    // carry: 0xFFFFFFFF = -1 (in 32-bit signed)
    // value: 0x0040 = 64
    const data = [0xff, 0xff, 0xff, 0xff, 0x40, 0x00];
    const result = parseReadEncoderResponse(data);
    expect(result).toEqual({ carry: -1, value: 64 });
  });
});

describe("generateSetCurrentPacket", () => {
  it("should generate correct packet for 1200mA", () => {
    // 1200mA / 200 = 6 -> 0x06
    const packet = generateSetCurrentPacket(0xe0, 0x06);
    expect(packet).toEqual([0xe0, 0x83, 0x06, 0x69]); // E0+83+06=169 -> 0xA9
  });

  it("should throw error for invalid MA value", () => {
    expect(() => generateSetCurrentPacket(0xe0, 0x10)).toThrow();
    expect(() => generateSetCurrentPacket(0xe0, -1)).toThrow();
  });
});
