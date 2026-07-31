const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../src');

const replacements = [
  // Text colors
  { regex: /text-white\/([0-9]+)/g, replace: 'text-foreground/$1' },
  { regex: /text-white(?!\/)/g, replace: 'text-foreground' },
  { regex: /text-black\/([0-9]+)/g, replace: 'text-background/$1' },
  { regex: /text-black(?!\/)/g, replace: 'text-background' },
  
  // Background colors
  { regex: /bg-white\/([0-9]+)/g, replace: 'bg-foreground/$1' },
  { regex: /bg-white(?!\/)/g, replace: 'bg-foreground' },
  { regex: /bg-black\/([0-9]+)/g, replace: 'bg-background/$1' },
  { regex: /bg-black(?!\/)/g, replace: 'bg-background' },
  
  // Border colors
  { regex: /border-white\/([0-9]+)/g, replace: 'border-foreground/$1' },
  { regex: /border-white(?!\/)/g, replace: 'border-foreground' },
  { regex: /border-black\/([0-9]+)/g, replace: 'border-background/$1' },
  { regex: /border-black(?!\/)/g, replace: 'border-background' },

  // From/Via/To Gradients
  { regex: /from-white\/([0-9]+)/g, replace: 'from-foreground/$1' },
  { regex: /from-white(?!\/)/g, replace: 'from-foreground' },
  { regex: /via-white\/([0-9]+)/g, replace: 'via-foreground/$1' },
  { regex: /via-white(?!\/)/g, replace: 'via-foreground' },
  { regex: /to-white\/([0-9]+)/g, replace: 'to-foreground/$1' },
  { regex: /to-white(?!\/)/g, replace: 'to-foreground' },
  
  { regex: /from-black\/([0-9]+)/g, replace: 'from-background/$1' },
  { regex: /from-black(?!\/)/g, replace: 'from-background' },
  { regex: /via-black\/([0-9]+)/g, replace: 'via-background/$1' },
  { regex: /via-black(?!\/)/g, replace: 'via-background' },
  { regex: /to-black\/([0-9]+)/g, replace: 'to-background/$1' },
  { regex: /to-black(?!\/)/g, replace: 'to-background' },
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

let modifiedFiles = 0;

walkDir(directoryPath, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(({ regex, replace }) => {
    content = content.replace(regex, replace);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles++;
    console.log(`Updated ${path.basename(filePath)}`);
  }
});

console.log(`Finished. Modified ${modifiedFiles} files.`);
