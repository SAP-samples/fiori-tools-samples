/**
 * Data Loader Utilities
 *
 * Utilities for loading training data and configuration files
 */

const fs = require('fs');
const path = require('path');

/**
 * Load training data from extracted patterns
 */
function loadTrainingData() {
  try {
    const trainingDataPath = path.resolve(__dirname, '../../../training-data');

    const data = {};

    // Load patterns
    const patternsFile = path.join(trainingDataPath, 'km-feedback-patterns.json');
    if (fs.existsSync(patternsFile)) {
      data.patterns = JSON.parse(fs.readFileSync(patternsFile, 'utf8'));
    }

    // Load corrections
    const correctionsFile = path.join(trainingDataPath, 'correction-dictionary.json');
    if (fs.existsSync(correctionsFile)) {
      data.corrections = JSON.parse(fs.readFileSync(correctionsFile, 'utf8'));
    }

    // Load quality examples
    const examplesFile = path.join(trainingDataPath, 'quality-examples.json');
    if (fs.existsSync(examplesFile)) {
      data.qualityExamples = JSON.parse(fs.readFileSync(examplesFile, 'utf8'));
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
    if (fs.existsSync(structuralFile)) {
      rules.structural = JSON.parse(fs.readFileSync(structuralFile, 'utf8'));
    }

    // Load formatting rules
    const formattingFile = path.join(rulesPath, 'formatting.json');
    if (fs.existsSync(formattingFile)) {
      rules.formatting = JSON.parse(fs.readFileSync(formattingFile, 'utf8'));
    }

    return rules;
  } catch (error) {
    console.warn('Warning: Could not load rules:', error.message);
    return {};
  }
}

module.exports = {
  loadTrainingData,
  loadRules
};