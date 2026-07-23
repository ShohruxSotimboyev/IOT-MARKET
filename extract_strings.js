const fs = require('fs');
const path = require('path');

const TRANSLATION_FILE = path.join(__dirname, 'frontend/src/i18n/translations.js');
const COMPONENTS_DIR = path.join(__dirname, 'frontend/src/components');
const PAGES_DIR = path.join(__dirname, 'frontend/src/pages');

// Simple regex to find common hardcoded strings that might have been missed
// This is not perfect, but it will help identify them.
const UZBEK_WORDS = ['yoki', 'va', 'haqida', 'uchun', 'bilan', 'yuborish', 'kiriting', 'qiling', 'tasdiqlash', 'parol', 'xatolik', 'muvaffaqiyatli'];

function scanDir(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(scanDir(fullPath));
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            results.push(fullPath);
        }
    }
    return results;
}

const allFiles = [...scanDir(PAGES_DIR), ...scanDir(COMPONENTS_DIR)];

const foundStrings = [];
for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    // find toast.error('...') or toast.success('...')
    const toastRegex = /toast\.(error|success)\((['"`])(.*?)\2\)/g;
    let match;
    while ((match = toastRegex.exec(content)) !== null) {
        foundStrings.push({ file, type: 'toast', text: match[3] });
    }
    
    // find placeholders
    const placeholderRegex = /placeholder=(['"`])(.*?)\1/g;
    while ((match = placeholderRegex.exec(content)) !== null) {
        if (/[a-zA-Z]/.test(match[2])) {
            foundStrings.push({ file, type: 'placeholder', text: match[2] });
        }
    }
    
    // find labels
    const labelRegex = /label=(['"`])(.*?)\1/g;
    while ((match = labelRegex.exec(content)) !== null) {
        if (/[a-zA-Z]/.test(match[2])) {
            foundStrings.push({ file, type: 'label', text: match[2] });
        }
    }
    
    // find text between tags >text<
    const tagRegex = />([^<{}]+)</g;
    while ((match = tagRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 2 && /[a-zA-Z]/.test(text) && !text.includes('&times;') && !text.includes('→')) {
            // Check if it looks like Uzbek or just text (not code like "=>")
            if (!/^[0-9\W]+$/.test(text) && text !== 'Demo: admin@iot.uz / 123456') {
                foundStrings.push({ file, type: 'text', text });
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, 'found_strings.json'), JSON.stringify(foundStrings, null, 2));
console.log(`Found ${foundStrings.length} potential strings.`);
