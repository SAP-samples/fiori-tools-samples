#!/usr/bin/env node

/**
 * Git History Analysis Script for KM Feedback Pattern Extraction
 *
 * This script analyzes git history to extract Knowledge Management (KM) feedback patterns
 * from commits that contain documentation updates and improvements.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class KMPatternExtractor {
    constructor() {
        this.patterns = {
            formatting: [],
            content: [],
            structure: [],
            technical: []
        };
        this.corrections = {
            typos: {},
            terminology: {},
            punctuation: {}
        };
        this.qualityExamples = [];
    }

    /**
     * Extract KM feedback commits from git history
     */
    extractKMCommits() {
        console.log('📊 Extracting KM feedback commits from git history...');

        const kmCommitPatterns = [
            'Apply suggestions',
            'text updates',
            'documentation updates',
            'fix: update',
            'updates based on',
            'cleanup text',
            'append updates'
        ];

        const commits = [];

        for (const pattern of kmCommitPatterns) {
            try {
                const result = execSync(`git log --oneline --grep="${pattern}" -n 20`, { encoding: 'utf8' });
                const lines = result.trim().split('\n').filter(line => line.trim());

                for (const line of lines) {
                    const [hash, ...messageParts] = line.split(' ');
                    const message = messageParts.join(' ');

                    if (hash && !commits.find(c => c.hash === hash)) {
                        commits.push({ hash, message, pattern });
                    }
                }
            } catch (error) {
                console.warn(`Warning: Could not extract commits for pattern "${pattern}"`);
            }
        }

        console.log(`Found ${commits.length} KM feedback commits`);
        return commits;
    }

    /**
     * Analyze a commit to extract patterns and improvements
     */
    analyzeCommit(commit) {
        try {
            const diffOutput = execSync(`git show ${commit.hash} --color=never`, { encoding: 'utf8' });
            const filesChanged = execSync(`git show ${commit.hash} --name-only --pretty=format:`, { encoding: 'utf8' });

            const files = filesChanged.trim().split('\n').filter(f => f.endsWith('.md'));

            if (files.length === 0) return;

            const analysis = {
                commit: commit.hash,
                message: commit.message,
                files: files,
                changes: this.extractChanges(diffOutput),
                patterns: this.identifyPatterns(diffOutput)
            };

            this.categorizePatterns(analysis);
            return analysis;

        } catch (error) {
            console.warn(`Warning: Could not analyze commit ${commit.hash}`);
            return null;
        }
    }

    /**
     * Extract before/after changes from git diff
     */
    extractChanges(diffOutput) {
        const changes = [];
        const lines = diffOutput.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('-') && !line.startsWith('---') && !line.startsWith('diff')) {
                const before = line.substring(1).trim();
                const nextLine = lines[i + 1];

                if (nextLine && nextLine.startsWith('+') && !nextLine.startsWith('+++')) {
                    const after = nextLine.substring(1).trim();

                    if (before !== after && before.length > 0 && after.length > 0) {
                        changes.push({ before, after, type: this.classifyChange(before, after) });
                    }
                }
            }
        }

        return changes;
    }

    /**
     * Classify the type of change based on before/after content
     */
    classifyChange(before, after) {
        // Typo corrections
        if (this.isTypoCorrection(before, after)) {
            return 'typo';
        }

        // Formatting changes
        if (this.isFormattingChange(before, after)) {
            return 'formatting';
        }

        // Structural changes
        if (this.isStructuralChange(before, after)) {
            return 'structural';
        }

        // Content improvements
        if (this.isContentImprovement(before, after)) {
            return 'content';
        }

        return 'other';
    }

    /**
     * Check if change is a typo correction
     */
    isTypoCorrection(before, after) {
        const beforeWords = before.toLowerCase().split(/\s+/);
        const afterWords = after.toLowerCase().split(/\s+/);

        if (beforeWords.length !== afterWords.length) return false;

        let differences = 0;
        for (let i = 0; i < beforeWords.length; i++) {
            if (beforeWords[i] !== afterWords[i]) {
                differences++;
                // Store typo correction
                if (differences === 1) {
                    this.corrections.typos[beforeWords[i]] = afterWords[i];
                }
            }
        }

        return differences === 1;
    }

    /**
     * Check if change is formatting-related
     */
    isFormattingChange(before, after) {
        const formatPatterns = [
            /^#+\s/,           // Headers
            /^[-*+]\s/,        // Lists
            /^\d+\.\s/,        // Numbered lists
            /\*\*.*\*\*/,      // Bold
            /`.*`/,            // Code
            /\[.*\]\(.*\)/     // Links
        ];

        return formatPatterns.some(pattern =>
            pattern.test(before) || pattern.test(after)
        );
    }

    /**
     * Check if change is structural
     */
    isStructuralChange(before, after) {
        const structuralKeywords = [
            'table of contents', 'overview', 'prerequisites', 'conclusion',
            'getting started', 'introduction', 'summary', 'checklist'
        ];

        return structuralKeywords.some(keyword =>
            before.toLowerCase().includes(keyword) || after.toLowerCase().includes(keyword)
        );
    }

    /**
     * Check if change is content improvement
     */
    isContentImprovement(before, after) {
        // Content improvements typically make text clearer, more specific, or more accurate
        return after.length > before.length ||
               after.split(' ').length > before.split(' ').length ||
               after.includes('such as') || after.includes('for example') ||
               after.includes('Note:') || after.includes('Important:');
    }

    /**
     * Identify high-level patterns in the diff
     */
    identifyPatterns(diffOutput) {
        const patterns = [];

        if (diffOutput.includes('# ') || diffOutput.includes('## ')) {
            patterns.push('header_formatting');
        }

        if (diffOutput.includes('- ') || diffOutput.includes('* ')) {
            patterns.push('list_formatting');
        }

        if (diffOutput.includes('```') || diffOutput.includes('`')) {
            patterns.push('code_formatting');
        }

        if (diffOutput.includes('[') && diffOutput.includes('](')) {
            patterns.push('link_formatting');
        }

        return patterns;
    }

    /**
     * Categorize patterns into the main categories
     */
    categorizePatterns(analysis) {
        for (const change of analysis.changes) {
            switch (change.type) {
                case 'formatting':
                    this.patterns.formatting.push({
                        ...change,
                        commit: analysis.commit,
                        file: analysis.files[0]
                    });
                    break;
                case 'content':
                    this.patterns.content.push({
                        ...change,
                        commit: analysis.commit,
                        file: analysis.files[0]
                    });
                    break;
                case 'structural':
                    this.patterns.structure.push({
                        ...change,
                        commit: analysis.commit,
                        file: analysis.files[0]
                    });
                    break;
                case 'typo':
                    this.patterns.technical.push({
                        ...change,
                        commit: analysis.commit,
                        file: analysis.files[0]
                    });
                    break;
            }
        }
    }

    /**
     * Analyze files that received minimal KM feedback as quality examples
     */
    identifyQualityExamples() {
        console.log('🏆 Identifying quality documentation examples...');

        try {
            // Find README files that haven't been modified recently
            const readmeFiles = execSync('find . -name "README.md" -type f', { encoding: 'utf8' })
                .trim().split('\n').filter(f => f);

            for (const file of readmeFiles) {
                try {
                    const commitCount = execSync(`git log --oneline "${file}" | wc -l`, { encoding: 'utf8' });
                    const recentChanges = execSync(`git log --oneline --since="6 months ago" "${file}" | wc -l`, { encoding: 'utf8' });

                    const totalCommits = parseInt(commitCount.trim());
                    const recentCommits = parseInt(recentChanges.trim());

                    // Files with few recent changes might be high quality
                    if (totalCommits > 3 && recentCommits < 3) {
                        const fileSize = fs.statSync(file).size;
                        if (fileSize > 5000) { // Substantial documentation
                            this.qualityExamples.push({
                                file: file,
                                totalCommits: totalCommits,
                                recentCommits: recentCommits,
                                size: fileSize,
                                score: this.calculateQualityScore(totalCommits, recentCommits, fileSize)
                            });
                        }
                    }
                } catch (error) {
                    // Skip files that cause errors
                }
            }

            // Sort by quality score
            this.qualityExamples.sort((a, b) => b.score - a.score);
            console.log(`Found ${this.qualityExamples.length} quality examples`);

        } catch (error) {
            console.warn('Warning: Could not identify quality examples');
        }
    }

    /**
     * Calculate quality score for documentation files
     */
    calculateQualityScore(totalCommits, recentCommits, fileSize) {
        // Higher score = better quality
        // Factors: established (totalCommits), stable (few recent changes), substantial (fileSize)
        return (totalCommits * 2) + (10 - recentCommits) + (fileSize / 1000);
    }

    /**
     * Save training data to JSON files
     */
    saveTrainingData() {
        console.log('💾 Saving training data...');

        const trainingDir = path.join(process.cwd(), 'training-data');

        // Save pattern data
        fs.writeFileSync(
            path.join(trainingDir, 'km-feedback-patterns.json'),
            JSON.stringify(this.patterns, null, 2)
        );

        // Save corrections dictionary
        fs.writeFileSync(
            path.join(trainingDir, 'correction-dictionary.json'),
            JSON.stringify(this.corrections, null, 2)
        );

        // Save quality examples
        fs.writeFileSync(
            path.join(trainingDir, 'quality-examples.json'),
            JSON.stringify(this.qualityExamples, null, 2)
        );

        console.log('✅ Training data saved to training-data/ directory');
    }

    /**
     * Generate summary report
     */
    generateSummary() {
        console.log('\n📋 KM Pattern Extraction Summary');
        console.log('================================');
        console.log(`Formatting patterns: ${this.patterns.formatting.length}`);
        console.log(`Content patterns: ${this.patterns.content.length}`);
        console.log(`Structural patterns: ${this.patterns.structure.length}`);
        console.log(`Technical patterns: ${this.patterns.technical.length}`);
        console.log(`Typo corrections: ${Object.keys(this.corrections.typos).length}`);
        console.log(`Quality examples: ${this.qualityExamples.length}`);

        console.log('\n🔝 Top Quality Examples:');
        this.qualityExamples.slice(0, 5).forEach((example, index) => {
            console.log(`${index + 1}. ${example.file} (score: ${example.score.toFixed(1)})`);
        });
    }

    /**
     * Main execution method
     */
    async run() {
        console.log('🚀 Starting KM Pattern Extraction...\n');

        // Extract commits
        const commits = this.extractKMCommits();

        // Analyze each commit
        console.log('🔍 Analyzing commits for patterns...');
        for (const commit of commits) {
            const analysis = this.analyzeCommit(commit);
            if (analysis) {
                console.log(`Analyzed: ${commit.hash} - ${commit.message}`);
            }
        }

        // Identify quality examples
        this.identifyQualityExamples();

        // Save training data
        this.saveTrainingData();

        // Generate summary
        this.generateSummary();

        console.log('\n🎉 KM pattern extraction completed successfully!');
    }
}

// Run the extractor if called directly
if (require.main === module) {
    const extractor = new KMPatternExtractor();
    extractor.run().catch(error => {
        console.error('❌ Error during extraction:', error.message);
        process.exit(1);
    });
}

module.exports = KMPatternExtractor;