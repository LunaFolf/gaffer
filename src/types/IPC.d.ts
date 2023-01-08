import { ChildProcessWithoutNullStreams } from 'child_process'

interface BootRecord {
  processName: string;
  bootDateTime: Date;
  processPath?: string;
  action: 'startup' | 'restart' | 'shutdown';
}

interface ChildObject {
  name: string;
  process: ChildProcessWithoutNullStreams;
}