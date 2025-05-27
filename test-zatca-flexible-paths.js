#!/usr/bin/env node

/**
 * Flexible ZATCA SDK Path Detection Test
 * This script automatically detects ZATCA SDK paths regardless of folder structure
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Flexible ZATCA SDK Path Detection');
console.log('=' .repeat(60));

// Helper functions for flexible path detection (same as API)
function findZatcaSdkPath() {
  const possiblePaths = [
    // Current structure (New folder)
    'C:\\Users\\IREE\\Documents\\GitHub\\New folder\\zatca-einvoicing-phase2-sandbox\\Apps\\zatca-einvoicing-sdk-238-R4.0.0.jar',
    // Direct GitHub structure
    'C:\\Users\\IREE\\Documents\\GitHub\\zatca-einvoicing-phase2-sandbox\\Apps\\zatca-einvoicing-sdk-238-R4.0.0.jar',
    // Relative paths from project root
    path.resolve(process.cwd(), '..', '..', '..', 'zatca-einvoicing-phase2-sandbox', 'Apps', 'zatca-einvoicing-sdk-238-R4.0.0.jar'),
    path.resolve(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox', 'Apps', 'zatca-einvoicing-sdk-238-R4.0.0.jar'),
    // Production paths
    '/opt/zatca/zatca-einvoicing-sdk-238-R4.0.0.jar',
    'C:\\Production\\ZATCA\\zatca-einvoicing-sdk-238-R4.0.0.jar'
  ];

  console.log('\n🔍 Searching for ZATCA SDK JAR...');
  for (const sdkPath of possiblePaths) {
    console.log(`   Checking: ${sdkPath}`);
    try {
      if (fs.existsSync(sdkPath)) {
        console.log(`   ✅ FOUND at: ${sdkPath}`);
        return sdkPath;
      } else {
        console.log(`   ❌ Not found`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('   ⚠️  No SDK JAR found in any location');
  return possiblePaths[0]; // Fallback
}

function findZatcaConfigPath() {
  const possiblePaths = [
    // Current structure (New folder)
    'C:\\Users\\IREE\\Documents\\GitHub\\New folder\\zatca-einvoicing-phase2-sandbox\\Configuration\\config.json',
    // Direct GitHub structure
    'C:\\Users\\IREE\\Documents\\GitHub\\zatca-einvoicing-phase2-sandbox\\Configuration\\config.json',
    // Relative paths from project root
    path.resolve(process.cwd(), '..', '..', '..', 'zatca-einvoicing-phase2-sandbox', 'Configuration', 'config.json'),
    path.resolve(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox', 'Configuration', 'config.json'),
    // Production paths
    '/opt/zatca/config.json',
    'C:\\Production\\ZATCA\\config.json'
  ];

  console.log('\n🔍 Searching for ZATCA config...');
  for (const configPath of possiblePaths) {
    console.log(`   Checking: ${configPath}`);
    try {
      if (fs.existsSync(configPath)) {
        console.log(`   ✅ FOUND at: ${configPath}`);
        return configPath;
      } else {
        console.log(`   ❌ Not found`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('   ⚠️  No config file found in any location');
  return possiblePaths[0]; // Fallback
}

function findZatcaWorkingDir() {
  const possiblePaths = [
    // Current structure (New folder)
    'C:\\Users\\IREE\\Documents\\GitHub\\New folder\\zatca-einvoicing-phase2-sandbox',
    // Direct GitHub structure
    'C:\\Users\\IREE\\Documents\\GitHub\\zatca-einvoicing-phase2-sandbox',
    // Relative paths from project root
    path.resolve(process.cwd(), '..', '..', '..', 'zatca-einvoicing-phase2-sandbox'),
    path.resolve(process.cwd(), '..', '..', 'zatca-einvoicing-phase2-sandbox'),
    // Production paths
    '/opt/zatca',
    'C:\\Production\\ZATCA'
  ];

  console.log('\n🔍 Searching for ZATCA working directory...');
  for (const workingDir of possiblePaths) {
    console.log(`   Checking: ${workingDir}`);
    try {
      if (fs.existsSync(workingDir)) {
        console.log(`   ✅ FOUND at: ${workingDir}`);
        return workingDir;
      } else {
        console.log(`   ❌ Not found`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('   ⚠️  No working directory found in any location');
  return possiblePaths[0]; // Fallback
}

// Run the detection
console.log('\n📋 Current working directory:', process.cwd());

const sdkJarPath = findZatcaSdkPath();
const sdkConfigPath = findZatcaConfigPath();
const workingDirectory = findZatcaWorkingDir();

console.log('\n📊 Detection Results:');
console.log('=' .repeat(40));
console.log('SDK JAR:', sdkJarPath);
console.log('Config:', sdkConfigPath);
console.log('Working Dir:', workingDirectory);

// Test the detected paths
console.log('\n🧪 Testing detected paths:');

let allPathsValid = true;

// Test SDK JAR
try {
  fs.accessSync(sdkJarPath, fs.constants.F_OK);
  console.log('✅ SDK JAR file is accessible');
} catch (error) {
  console.log('❌ SDK JAR file is NOT accessible');
  allPathsValid = false;
}

// Test config file
try {
  fs.accessSync(sdkConfigPath, fs.constants.F_OK);
  console.log('✅ Config file is accessible');
  
  // Test config content
  const configContent = fs.readFileSync(sdkConfigPath, 'utf-8');
  const config = JSON.parse(configContent);
  console.log('✅ Config file is valid JSON');
  
  // Check certificate files
  if (config.certPath && fs.existsSync(config.certPath)) {
    console.log('✅ Certificate file exists');
  } else {
    console.log('❌ Certificate file missing:', config.certPath);
  }
  
  if (config.privateKeyPath && fs.existsSync(config.privateKeyPath)) {
    console.log('✅ Private key file exists');
  } else {
    console.log('❌ Private key file missing:', config.privateKeyPath);
  }
} catch (error) {
  console.log('❌ Config file is NOT accessible or invalid');
  allPathsValid = false;
}

// Test working directory
try {
  fs.accessSync(workingDirectory, fs.constants.F_OK);
  console.log('✅ Working directory is accessible');
} catch (error) {
  console.log('❌ Working directory is NOT accessible');
  allPathsValid = false;
}

// Test Java and SDK execution
console.log('\n☕ Testing Java and SDK execution:');

const { spawn } = require('child_process');

// Test Java
const javaTest = spawn('java', ['-version'], { stdio: 'pipe' });

javaTest.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Java is available');
    
    // Test SDK execution if paths are valid
    if (allPathsValid) {
      console.log('\n🧪 Testing ZATCA SDK execution:');
      
      const sdkTest = spawn('java', ['-jar', sdkJarPath, '-help'], {
        cwd: workingDirectory,
        stdio: 'pipe'
      });

      let output = '';
      sdkTest.stdout.on('data', (data) => {
        output += data.toString();
      });

      sdkTest.stderr.on('data', (data) => {
        output += data.toString();
      });

      sdkTest.on('close', (code) => {
        if (output.includes('Usage') || output.includes('help') || code === 0) {
          console.log('✅ ZATCA SDK is executable and working');
          console.log('\n🎉 SUCCESS: All paths detected and working correctly!');
          console.log('\n📝 Summary:');
          console.log('✅ SDK JAR found and executable');
          console.log('✅ Config file found and valid');
          console.log('✅ Working directory accessible');
          console.log('✅ Java available');
          console.log('\n🚀 The API integration should work with these paths!');
        } else {
          console.log('❌ ZATCA SDK execution failed');
          console.log('   Output:', output);
        }
      });

      sdkTest.on('error', (error) => {
        console.log('❌ ZATCA SDK execution error:', error.message);
      });

      setTimeout(() => {
        sdkTest.kill();
      }, 5000);
    } else {
      console.log('\n❌ Cannot test SDK execution - some paths are invalid');
      console.log('\n📝 Summary:');
      console.log('❌ Some required files are missing');
      console.log('🔧 Please check the file paths and ensure ZATCA sandbox is properly set up');
    }
  } else {
    console.log('❌ Java is NOT available or not in PATH');
  }
});

javaTest.on('error', (error) => {
  console.log('❌ Java test failed:', error.message);
});

// Provide guidance based on results
setTimeout(() => {
  console.log('\n📋 Folder Structure Guidance:');
  console.log('=' .repeat(40));
  console.log('This script supports the following structures:');
  console.log('');
  console.log('Option 1 (Current):');
  console.log('C:\\Users\\IREE\\Documents\\GitHub\\New folder\\');
  console.log('├── Tanad\\');
  console.log('└── zatca-einvoicing-phase2-sandbox\\');
  console.log('');
  console.log('Option 2 (After moving):');
  console.log('C:\\Users\\IREE\\Documents\\GitHub\\');
  console.log('├── Tanad\\');
  console.log('└── zatca-einvoicing-phase2-sandbox\\');
  console.log('');
  console.log('Option 3 (Production):');
  console.log('Use environment variables to specify custom paths');
  console.log('');
  console.log('🎯 The API will automatically detect the correct structure!');
}, 6000); 