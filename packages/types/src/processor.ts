export type ProcessorType = 'CPU' | 'GPU';
export type Manufacturer = 'INTEL' | 'AMD' | 'NVIDIA';

export interface ProcessorBase {
  id: string;
  type: ProcessorType;
  manufacturer: Manufacturer;
  modelName: string;
  slug: string;
  codeName: string | null;
  generation: number | null;
  releaseDate: string | null;
  architecture: string | null;
  processNm: number | null;
  tdpWatts: number | null;
  msrpUsd: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CpuSpecs {
  cores: number;
  threads: number;
  baseClockGhz: number;
  boostClockGhz: number | null;
  l3CacheMb: number | null;
  socket: string | null;
  integratedGraphics: string | null;
}

export interface GpuSpecs {
  shaderUnits: number;
  vramGb: number;
  vramType: string | null;
  memoryBusBits: number | null;
  memoryBandwidthGbps: number | null;
  baseClockMhz: number;
  boostClockMhz: number | null;
  rayTracingCores: number | null;
  tensorCores: number | null;
}

export type Cpu = ProcessorBase & { type: 'CPU' } & CpuSpecs;
export type Gpu = ProcessorBase & { type: 'GPU' } & GpuSpecs;
export type Processor = Cpu | Gpu;

export interface BenchmarkScore {
  id: string;
  processorId: string;
  benchmarkType: string;
  score: number;
  source: string;
  recordedAt: string;
}
