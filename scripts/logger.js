const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
const errorLogFile = path.join(logsDir, 'error.log');
const accessLogFile = path.join(logsDir, 'access.log');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function formatTimestamp() {
  return new Date().toISOString();
}

function logError(error, context = '') {
  const timestamp = formatTimestamp();
  const logEntry = `[${timestamp}] ERROR ${context}: ${error.message}\n${error.stack}\n\n`;
  
  fs.appendFileSync(errorLogFile, logEntry);
  console.error(`[${timestamp}] ERROR ${context}:`, error.message);
}

function logAccess(req, res) {
  const timestamp = formatTimestamp();
  const logEntry = `[${timestamp}] ${req.method} ${req.url} - ${res.statusCode}\n`;
  
  fs.appendFileSync(accessLogFile, logEntry);
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${res.statusCode}`);
}

function logInfo(message, context = '') {
  const timestamp = formatTimestamp();
  const logEntry = `[${timestamp}] INFO ${context}: ${message}\n`;
  
  console.log(`[${timestamp}] INFO ${context}: ${message}`);
}

module.exports = { logError, logAccess, logInfo };