import { exportApplications } from './controllers/exportController.js';
import fs from 'fs';

const mockReq = {
  query: { columns: 'name,email,category,research_area,eligibility,created_at' }
};

class MockRes {
  constructor() {
    this.headers = {};
    this.stream = fs.createWriteStream('export_test.xlsx');
  }
  setHeader(k, v) { this.headers[k] = v; }
  status(code) {
    console.log('Status set to:', code);
    return this;
  }
  json(data) {
    console.log('JSON returned:', data);
  }
  
  // Writable stream methods that exceljs expects from Express response
  write(chunk, encoding, callback) {
    return this.stream.write(chunk, encoding, callback);
  }
  end(chunk, encoding, callback) {
    console.log('Stream ended successfully');
    this.stream.end(chunk, encoding, callback);
  }
  on(event, handler) {
    this.stream.on(event, handler);
  }
  once(event, handler) {
    this.stream.once(event, handler);
  }
  emit(event, ...args) {
    this.stream.emit(event, ...args);
  }
  removeListener(event, handler) {
    this.stream.removeListener(event, handler);
  }
}

async function test() {
  const res = new MockRes();
  try {
    await exportApplications(mockReq, res);
  } catch(e) {
    console.error("Top level error:", e);
  }
}

test();
