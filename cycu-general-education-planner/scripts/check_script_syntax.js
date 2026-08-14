const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'index.html');
const raw = fs.readFileSync(FILE, 'utf8');

const start = raw.indexOf('<script>');
const end = raw.lastIndexOf('</script>');
if (start === -1 || end === -1 || end <= start) {
  console.error('No script block found in index.html');
  process.exit(2);
}

const script = raw.slice(start + '<script>'.length, end);

try {
  // Try to create a function from the script to detect syntax errors without executing DOM calls
  new Function(script);
  console.log('No syntax errors detected in the main <script> block.');
} catch (e) {
  console.error('Syntax error detected when parsing <script> block:');
  console.error(e && e.stack ? e.stack : e.toString());
  process.exit(1);
}
