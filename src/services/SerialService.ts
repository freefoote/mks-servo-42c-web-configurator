import {
  generateDownlinkPacket,
  parseUplinkPacket,
  generateReadEncoderPacket,
  parseReadEncoderResponse,
  generateReadPulsesPacket,
  parseReadPulsesResponse,
  generateReadErrorPacket,
  parseReadErrorResponse,
} from "@/lib/serialCommand";
import { useMotorStore } from "@/stores/motor";

export class SerialService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private receiveBuffer: number[] = [];
  private positionPollingInterval: ReturnType<typeof setInterval> | null = null;
  private _motorStore: ReturnType<typeof useMotorStore> | null = null;
  private keepReading = true;

  private get motorStore() {
    if (!this._motorStore) {
      this._motorStore = useMotorStore();
    }
    return this._motorStore;
  }

  // Track pending requests to match responses
  // Using a combined key: "slaveAddr-packetLength" to support multiple concurrent requests
  private pendingRequests: Map<
    string,
    {
      resolve: (value: number[] | null) => void;
      reject: (reason?: unknown) => void;
      timeout: ReturnType<typeof setTimeout>;
    }
  > = new Map();

  async requestPort(): Promise<void> {
    try {
      if (!navigator.serial) {
        throw new Error("Web Serial API is not supported in this browser.");
      }
      this.port = await navigator.serial.requestPort();
    } catch (error) {
      console.error("Failed to request serial port:", error);
      throw error;
    }
  }

  async connect(baudRate: number): Promise<void> {
    if (!this.port) {
      await this.requestPort();
    }

    if (!this.port) {
      return;
    }

    try {
      await this.port.open({ baudRate });
      this.motorStore.connection.isConnected = true;
      this.motorStore.connection.baudRate = baudRate;

      this.writer = this.port.writable?.getWriter() ?? null;

      // Start reading loop
      this.keepReading = true;
      void this.readLoop();

      console.warn("Serial port connected");
      // Initialize motor status by querying readable parameters
      void this.initializeMotorStatus();
    } catch (error) {
      console.error("Failed to connect to serial port:", error);
      this.motorStore.connection.isConnected = false;
      throw error;
    }
  }

  private async initializeMotorStatus(): Promise<void> {
    const slaveAddr = this.motorStore.connection.slaveAddress;

    try {
      // Query EN Status (command 0x3A)
      const enStatus = await this.readEnStatus(slaveAddr);
      if (enStatus !== null) {
        this.motorStore.updateStatus({ enStatus });
      }
    } catch (error) {
      console.warn("Failed to query EN status:", error);
    }

    try {
      // Query Protection Status (command 0x3E)
      const protectionStatus = await this.readProtectionStatus(slaveAddr);
      if (protectionStatus !== null) {
        this.motorStore.updateStatus({ protectionStatus });
      }
    } catch (error) {
      console.warn("Failed to query protection status:", error);
    }

    try {
      // Query Encoder Value (command 0x30)
      const encoderData = await this.readEncoderValue(slaveAddr);
      if (encoderData) {
        this.motorStore.updateStatus({
          encoderValue: encoderData.value,
          encoderCarry: encoderData.carry,
        });
      }
    } catch (error) {
      console.warn("Failed to query encoder value:", error);
    }

    try {
      // Query Pulses Received (command 0x33)
      const pulsesReceived = await this.readPulsesReceived(slaveAddr);
      if (pulsesReceived !== null) {
        this.motorStore.updateStatus({ pulsesReceived });
      }
    } catch (error) {
      console.warn("Failed to query pulses received:", error);
    }
  }

  private async readLoop() {
    if (!this.port || !this.port.readable) {
      return;
    }

    this.reader = this.port.readable.getReader();
    try {
      while (this.keepReading) {
        const { value, done } = await this.reader.read();
        if (done) {
          console.warn("Serial reader done");
          break;
        }
        if (value) {
          // Add received bytes to buffer
          for (let i = 0; i < value.length; i++) {
            this.receiveBuffer.push(value[i] as number);
          }
          // Try to parse complete packets
          this.processReceiveBuffer();
        }
      }
    } catch (error) {
      if (this.keepReading) {
        console.error("Read loop error:", error);
      }
    } finally {
      if (this.reader) {
        this.reader.releaseLock();
        this.reader = null;
      }
    }
  }

  async disconnect() {
    this.stopPositionPolling();
    this.keepReading = false;

    if (this.reader) {
      await this.reader
        .cancel()
        .catch((e) => console.error("Error cancelling reader:", e));
      this.reader = null;
    }

    if (this.writer) {
      this.writer.releaseLock();
      this.writer = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch (e) {
        console.error("Error closing port:", e);
      }
      this.port = null;
    }

    this.receiveBuffer = [];
    this.motorStore.connection.isConnected = false;
    this.rejectAllPendingRequests(new Error("Disconnected"));
  }

  private rejectAllPendingRequests(reason: unknown) {
    for (const [, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(reason);
    }
    this.pendingRequests.clear();
  }

  async sendPacket(packet: number[]): Promise<void> {
    if (!this.writer) {
      throw new Error("Serial port not writable");
    }
    const data = new Uint8Array(packet);
    await this.writer.write(data);
    // Track packet in store
    this.motorStore.addSentPacket(packet);
  }

  private async sendPacketAndWaitForResponse(
    packet: number[],
    timeoutMs: number = 1000,
  ): Promise<number[] | null> {
    const slaveAddr = packet[0] as number;
    // Create a unique key based on slave address and expected response length
    const requestKey = `${slaveAddr}-${packet.length}`;

    return new Promise<number[] | null>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestKey);
        reject(new Error("Response timeout"));
      }, timeoutMs);

      this.pendingRequests.set(requestKey, { resolve, reject, timeout });

      this.sendPacket(packet).catch((err) => {
        clearTimeout(timeout);
        this.pendingRequests.delete(requestKey);
        reject(err instanceof Error ? err : new Error(String(err)));
      });
    });
  }

  private processReceiveBuffer(): void {
    while (this.receiveBuffer.length >= 3) {
      let parsed = null;
      let packetLength = 3;

      while (packetLength <= Math.min(this.receiveBuffer.length, 20)) {
        const potentialPacket = this.receiveBuffer.slice(0, packetLength);
        const parsedCandidate = parseUplinkPacket(potentialPacket);
        if (parsedCandidate.valid) {
          parsed = parsedCandidate;
          break;
        }
        packetLength++;
      }

      if (parsed) {
        this.receiveBuffer.splice(0, packetLength);
        this.handleParsedPacket(parsed);
      } else if (this.receiveBuffer.length > 50) {
        this.receiveBuffer.shift();
      } else {
        break;
      }
    }
  }

  private handleParsedPacket(parsed: {
    slaveAddr: number;
    data: number[];
    valid: boolean;
  }): void {
    // Track received packet in store
    this.motorStore.addReceivedPacket(parsed.data);

    // Try to match using combined key first
    const responseKey = `${parsed.slaveAddr}-${parsed.data.length}`;
    const pending = this.pendingRequests.get(responseKey);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(responseKey);
      pending.resolve(parsed.data);
      return;
    }
    this.handleUnsolicitedPacket(parsed);
  }

  private handleUnsolicitedPacket(parsed: {
    slaveAddr: number;
    data: number[];
    valid: boolean;
  }): void {
    if (parsed.data.length === 6) {
      const encoderData = parseReadEncoderResponse(parsed.data);
      if (encoderData) {
        this.motorStore.updateStatus({
          encoderValue: encoderData.value,
          encoderCarry: encoderData.carry,
        });
        return;
      }
    }

    if (parsed.data.length === 4) {
      const pulses = parseReadPulsesResponse(parsed.data);
      if (pulses !== null) {
        this.motorStore.updateStatus({ pulsesReceived: pulses });
        return;
      }
    }

    if (parsed.data.length === 2) {
      const error = parseReadErrorResponse(parsed.data);
      if (error !== null) {
        this.motorStore.updateStatus({ errorDegrees: error });
        return;
      }
    }

    if (parsed.data.length === 1) {
      this.motorStore.updateStatus({ enStatus: parsed.data[0] });
    }
  }

  startPositionPolling(
    slaveAddr: number,
    callback: (position: { carry: number; value: number }) => void,
    intervalMs: number = 500,
  ): void {
    this.stopPositionPolling();
    this.positionPollingInterval = setInterval(() => {
      // Poll encoder data
      const encoderPacket = generateReadEncoderPacket(slaveAddr);
      this.sendPacketAndWaitForResponse(encoderPacket, 500)
        .then((responseData) => {
          if (responseData) {
            const encoderData = parseReadEncoderResponse(responseData);
            if (encoderData) {
              this.motorStore.updateStatus({
                encoderValue: encoderData.value,
                encoderCarry: encoderData.carry,
              });
              callback(encoderData);
            }
          }
        })
        .catch((err) => {
          // Only log if it's not a timeout (which might be expected during busy periods)
          if (err instanceof Error && err.message !== "Response timeout") {
            console.error("Encoder polling error:", err);
          }
        });

      // Poll pulses received
      const pulsesPacket = generateReadPulsesPacket(slaveAddr);
      this.sendPacketAndWaitForResponse(pulsesPacket, 500)
        .then((responseData) => {
          if (responseData) {
            const pulses = parseReadPulsesResponse(responseData);
            if (pulses !== null) {
              this.motorStore.updateStatus({ pulsesReceived: pulses });
            }
          }
        })
        .catch((err) => {
          if (err instanceof Error && err.message !== "Response timeout") {
            console.error("Pulses polling error:", err);
          }
        });

      // Poll error degrees
      const errorPacket = generateReadErrorPacket(slaveAddr);
      this.sendPacketAndWaitForResponse(errorPacket, 500)
        .then((responseData) => {
          if (responseData) {
            const error = parseReadErrorResponse(responseData);
            if (error !== null) {
              this.motorStore.updateStatus({ errorDegrees: error });
            }
          }
        })
        .catch((err) => {
          if (err instanceof Error && err.message !== "Response timeout") {
            console.error("Error degrees polling error:", err);
          }
        });
    }, intervalMs);
  }

  stopPositionPolling(): void {
    if (this.positionPollingInterval) {
      clearInterval(this.positionPollingInterval);
      this.positionPollingInterval = null;
    }
  }

  async readEncoderValue(
    slaveAddr: number,
  ): Promise<{ carry: number; value: number } | null> {
    const packet = generateReadEncoderPacket(slaveAddr);
    const data = await this.sendPacketAndWaitForResponse(packet);
    return data ? parseReadEncoderResponse(data) : null;
  }

  async readPulsesReceived(slaveAddr: number): Promise<number | null> {
    const packet = generateReadPulsesPacket(slaveAddr);
    const data = await this.sendPacketAndWaitForResponse(packet);
    return data ? parseReadPulsesResponse(data) : null;
  }

  async readErrorDegrees(slaveAddr: number): Promise<number | null> {
    const packet = generateReadErrorPacket(slaveAddr);
    const data = await this.sendPacketAndWaitForResponse(packet);
    return data ? parseReadErrorResponse(data) : null;
  }

  async readEnStatus(slaveAddr: number): Promise<number | null> {
    const packet = generateDownlinkPacket(slaveAddr, 0x3a);
    const data = await this.sendPacketAndWaitForResponse(packet);
    return data && data.length > 0 ? (data[0] ?? null) : null;
  }

  async readProtectionStatus(slaveAddr: number): Promise<number | null> {
    const packet = generateDownlinkPacket(slaveAddr, 0x3e);
    const data = await this.sendPacketAndWaitForResponse(packet);
    return data && data.length > 0 ? (data[0] ?? null) : null;
  }

  async sendCommandAndWaitForStatus(packet: number[]): Promise<boolean> {
    const data = await this.sendPacketAndWaitForResponse(packet);
    return data ? data[0] === 1 : false;
  }
}

export const serialService = new SerialService();
