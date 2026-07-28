const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src', 'admin'));
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;

    // Fix navigate('/something') to navigate('/admin/something')
    // except if it already starts with /admin
    content = content.replace(/navigate\(['"]\/(?!admin)(.*?)['"]\)/g, "navigate('/admin/$1')");

    // Fix to="/something" to to="/admin/something"
    content = content.replace(/to=['"]\/(?!admin)(.*?)['"]/g, 'to="/admin/$1"');

    // Fix to={`/something`} to to={`/admin/something`}
    content = content.replace(/to=\{`\/(?!admin)(.*?)`\}/g, 'to={`/admin/$1`}');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed:', file);
        changedFiles++;
    }
});

console.log('Total files changed:', changedFiles);
