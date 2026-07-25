import fs from 'fs';
import path from 'path';

const sourceDir = path.join(process.cwd(), 'Photos');
const destDir = path.join(process.cwd(), 'public', 'images', 'products');

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }

  const elements = fs.readdirSync(from);

  for (const element of elements) {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    const stat = fs.lstatSync(fromPath);

    if (stat.isFile()) {
      fs.copyFileSync(fromPath, toPath);
    } else if (stat.isDirectory()) {
      copyFolderSync(fromPath, toPath);
    }
  }
}

if (fs.existsSync(sourceDir)) {
  console.log('Copying images from', sourceDir, 'to', destDir);
  copyFolderSync(sourceDir, destDir);
  console.log('Images copied successfully.');
} else {
  console.log('Source directory not found.');
}
