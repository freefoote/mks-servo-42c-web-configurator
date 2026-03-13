# MKS Servo 42c Control Application

A web-based control application for the [MKS Servo 42c](https://github.com/makerbase-mks/MKS-SERVO42C) closed-loop stepper motor. Built with Vue 3, TypeScript, Vite, and TailwindCSS, this application provides a user-friendly interface for testing and controlling the servo motor via serial communication.

## Features

- **Serial Communication**: Real-time control of MKS Servo 42c motors via serial port
- **Motor Parameters**: Configure motor type, current, speed, acceleration, and PID tuning
- **Motion Control**: Jog controls, constant speed operation, and position-based movement
- **Position Polling**: Continuous encoder feedback at configurable intervals (default 500ms)
- **Zero Mode**: Home and zero-point calibration
- **Serial Monitor**: Real-time hex packet inspection for debugging
- **Responsive UI**: Clean, intuitive interface with TailwindCSS

## Project Structure

```
src/
├── components/          # Vue components organized by function
│   ├── controls/       # Individual control components
│   ├── inputs/         # Input/selector components
│   ├── motion/         # Motion control components
│   ├── panels/         # Panel components (connection, status, monitor)
│   └── MotorControlDashboard.vue
├── lib/                # Serial command library (packet generation/parsing)
├── services/           # SerialService for port communication
├── stores/             # Pinia store for application state
└── App.vue
```

## Setup & Running

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm run test

# Check types and lint
pnpm run check
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Hardware Requirements

- MKS Servo 42c motor with controller
- USB/Serial adapter (for serial port communication)
- Appropriate power supply (7-28V DC, up to 3A)

## References

- [MKS Servo 42c GitHub Repository](https://github.com/makerbase-mks/MKS-SERVO42C)
- [MKS Servo 42c Documentation](https://vallder.com/wp-content/uploads/2024/06/MKS-SERVO42C-User-Manual-V1.1.2.pdf)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)

## Safety Note

This application provides direct control over motor parameters. Always verify motor connections, power supply voltage, and mechanical load before running commands that could cause unexpected motion.
