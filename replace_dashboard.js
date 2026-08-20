const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/LOQ/Downloads/FIESTO/src';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directory);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('/dashboard')) {
        content = content.replace(/\/dashboard/g, '/organizer');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
