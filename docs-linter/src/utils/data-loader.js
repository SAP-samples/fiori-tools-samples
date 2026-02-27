/**
 * Data Loader Utilities
 *
 * Utilities for loading training data and configuration files
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load training data from extracted patterns
 */
function loadTrainingData() {
  try {
    const trainingDataPath = path.resolve(__dirname, '../../../training-data');

    const data = {};

    // Load patterns
    const patternsFile = path.join(trainingDataPath, 'km-feedback-patterns.json');
    if (existsSync(patternsFile)) {
      data.patterns = JSON.parse(readFileSync(patternsFile, 'utf8'));
    }

    // Load corrections
    const correctionsFile = path.join(trainingDataPath, 'correction-dictionary.json');
    if (existsSync(correctionsFile)) {
      data.corrections = JSON.parse(readFileSync(correctionsFile, 'utf8'));
    }

    // Load quality examples
    const examplesFile = path.join(trainingDataPath, 'quality-examples.json');
    if (existsSync(examplesFile)) {
      data.qualityExamples = JSON.parse(readFileSync(examplesFile, 'utf8'));
    }

    return data;
  } catch (error) {
    console.warn('Warning: Could not load training data:', error.message);
    return {};
  }
}

/**
 * Load rule configuration
 */
function loadRules() {
  try {
    const rulesPath = path.resolve(__dirname, '../../rules');
    const rules = {};

    // Load structural rules
    const structuralFile = path.join(rulesPath, 'structural.json');
    if (existsSync(structuralFile)) {
      rules.structural = JSON.parse(readFileSync(structuralFile, 'utf8'));
    }

    // Load formatting rules
    const formattingFile = path.join(rulesPath, 'formatting.json');
    if (existsSync(formattingFile)) {
      rules.formatting = JSON.parse(readFileSync(formattingFile, 'utf8'));
    }

    return rules;
  } catch (error) {
    console.warn('Warning: Could not load rules:', error.message);
    return {};
  }
}

export {
  loadTrainingData,
  loadRules
};