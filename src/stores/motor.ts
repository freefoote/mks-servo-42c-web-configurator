import { defineStore } from "pinia";
import { ref } from "vue";

export const useMotorStore = defineStore("motor", () => {
  const connection = ref({
    port: null as object | null,
    isConnected: false,
    portName: "",
    baudRate: 38400,
    slaveAddress: 0xe0,
  });

  const motorStatus = ref({
    encoderValue: 0,
    encoderCarry: 0,
    pulsesReceived: 0,
    errorDegrees: 0,
    enStatus: 0, // 0=unknown, 1=enabled, 2=disabled
    protectionStatus: 0, // 0=unknown, 1=protected, 2=unprotected
    workMode: 1, // 0=CR_OPEN, 1=CR_vFOC, 2=CR_UART
    motorType: 1, // 0=0.9°, 1=1.8°
    currentMa: 1200,
    subdivision: 16,
    direction: 0, // 0=CW, 1=CCW
    enActive: 0, // 0=L, 1=H, 2=Hold
    autoSdd: false,
    protectionEnabled: false,
    interpolationEnabled: true,
    zeroMode: 0, // 0=Disable, 1=DirMode, 2=NearMode
    zeroDirection: 0, // 0=CW, 1=CCW
    zeroSpeed: 2, // 0-4, smaller = faster
    baudRate: 38400,
    slaveAddress: 0xe0,
  });

  const isMotorMoving = ref(false);

  // Continuous polling for testing purposes
  const polling = ref({
    isActive: false,
    interval: 500, // ms, default to 500ms as requested
    positionUpdateCallback: null as
      | ((position: { carry: number; value: number }) => void)
      | null,
  });

  // Track sent and received packets for serial monitor
  const packetHistory = ref({
    sentPackets: [] as Array<{ timestamp: Date; data: number[] }>,
    receivedPackets: [] as Array<{ timestamp: Date; data: number[] }>,
  });

  function connect(portName: string, baudRate: number) {
    // In a real implementation, this would call the serial service
    // For now, we'll just update the store
    connection.value.isConnected = true;
    connection.value.portName = portName;
    connection.value.baudRate = baudRate;
    // Note: Actual serial connection would happen in the service
  }

  function disconnect() {
    // In a real implementation, this would call the serial service
    connection.value.isConnected = false;
    connection.value.port = null;
    // Note: Actual serial disconnection would happen in the service
  }

  function updateStatus(status: Partial<typeof motorStatus.value>) {
    motorStatus.value = { ...motorStatus.value, ...status };
  }

  function sendCommand(command: number[]) {
    // In a real implementation, this would call the serial service
    // For now, we'll just log it
    console.warn("Sending command:", command);
  }

  // Polling actions
  function startPositionPolling(
    callback: (position: { carry: number; value: number }) => void,
  ) {
    polling.value.isActive = true;
    polling.value.positionUpdateCallback = callback;
    // In practice, this would set up an interval to call generateReadEncoderPacket
    // and process the response
    // The actual polling would be handled by the serial service
  }

  function stopPositionPolling() {
    polling.value.isActive = false;
    polling.value.positionUpdateCallback = null;
  }

  function setPollingInterval(interval: number) {
    polling.value.interval = interval;
    // If polling is active, restart with new interval
    if (polling.value.isActive && polling.value.positionUpdateCallback) {
      stopPositionPolling();
      startPositionPolling(polling.value.positionUpdateCallback);
    }
  }

  function addSentPacket(data: number[]) {
    packetHistory.value.sentPackets.push({
      timestamp: new Date(),
      data,
    });
    // Keep only the last 50 packets
    if (packetHistory.value.sentPackets.length > 50) {
      packetHistory.value.sentPackets.shift();
    }
  }

  function addReceivedPacket(data: number[]) {
    packetHistory.value.receivedPackets.push({
      timestamp: new Date(),
      data,
    });
    // Keep only the last 50 packets
    if (packetHistory.value.receivedPackets.length > 50) {
      packetHistory.value.receivedPackets.shift();
    }
  }

  function clearPacketHistory() {
    packetHistory.value.sentPackets = [];
    packetHistory.value.receivedPackets = [];
  }

  return {
    connection,
    motorStatus,
    isMotorMoving,
    polling,
    packetHistory,
    connect,
    disconnect,
    updateStatus,
    sendCommand,
    startPositionPolling,
    stopPositionPolling,
    setPollingInterval,
    addSentPacket,
    addReceivedPacket,
    clearPacketHistory,
  };
});
