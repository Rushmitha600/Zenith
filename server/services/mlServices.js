// server/services/mlService.js
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export const predictFraud = async (features) => {
  const scriptPath = path.join(process.cwd(), 'ml-models/predict_fraud.py');
  const { stdout } = await execAsync(`python ${scriptPath} '${JSON.stringify(features)}'`);
  return JSON.parse(stdout);
};

export const predictPremium = async (riskFactors) => {
  const scriptPath = path.join(process.cwd(), 'ml-models/predict_premium.py');
  const { stdout } = await execAsync(`python ${scriptPath} '${JSON.stringify(riskFactors)}'`);
  return JSON.parse(stdout);
};