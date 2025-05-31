#!/usr/bin/env node

/**
 * Test ZATCA SDK Path Configuration
 * This script verifies that the ZATCA SDK paths are correct and accessible
 */

const fs = require('fs');
const path = require('path');

// Test the exact paths used in the API
const sdkJarPath = 'C:\\Users\\IREE\\Documents\\GitHub\\New folder\\zatca-einvoicing-phase2-sandbox\\Apps\\zatca-einvoicing-sdk-238-R4.0.0.jar';
const sdkConfigPath = 'C:\\Users\\IREE\\Documents\\GitHub\\New folder\\zatca-einvoicing-phase2-sandbox\\Configuration\\config.json';
const workingDirectory = 'C:\\Users\\IREE\\Documents\\GitHub\\New folder\\zatca-einvoicing-phase2-sandbox';

console.log('🔍 Testing ZATCA SDK Path Configuration');
console.log('=' .repeat(50));

console.log('\n📁 Checking paths:');
console.log('SDK JAR:', sdkJarPath);
console.log('Config:', sdkConfigPath);
console.log('Working Dir:', workingDirectory);

// Test file existence
console.log('\n🧪 Testing file accessibility:');

try {
  fs.accessSync(sdkJarPath, fs.constants.F_OK);
  console.log('✅ SDK JAR file exists');
} catch (error) {
  console.log('❌ SDK JAR file NOT found');
  console.log('   Expected at:', sdkJarPath);
}

try {
  fs.accessSync(sdkConfigPath, fs.constants.F_OK);
  console.log('✅ Config file exists');
} catch (error) {
  console.log('❌ Config file NOT found');
  console.log('   Expected at:', sdkConfigPath);
}

try {
  fs.accessSync(workingDirectory, fs.constants.F_OK);
  console.log('✅ Working directory exists');
} catch (error) {
  console.log('❌ Working directory NOT found');
  console.log('   Expected at:', workingDirectory);
}

// Test config file content
console.log('\n📄 Testing config file content:');
try {
  const configContent = fs.readFileSync(sdkConfigPath, 'utf-8');
  const config = JSON.parse(configContent);
  console.log('✅ Config file is valid JSON');
  console.log('   Certificate path:', config.certPath);
  console.log('   Private key path:', config.privateKeyPath);
  
  // Check if certificate files exist
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
  console.log('❌ Error reading config file:', error.message);
}

// Test Java availability
console.log('\n☕ Testing Java availability:');
const { spawn } = require('child_process');

const javaTest = spawn('java', ['-version'], { stdio: 'pipe' });

javaTest.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Java is available');
  } else {
    console.log('❌ Java is NOT available or not in PATH');
  }
});

javaTest.on('error', (error) => {
  console.log('❌ Java test failed:', error.message);
});

// Test ZATCA SDK execution
console.log('\n🧪 Testing ZATCA SDK execution:');

setTimeout(() => {
  if (fs.existsSync(sdkJarPath)) {
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
        console.log('✅ ZATCA SDK is executable');
        console.log('   SDK appears to be working correctly');
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
      console.log('\n🎯 Path test completed!');
      console.log('\n📝 Summary:');
      console.log('If all checks passed, the ZATCA integration should work.');
      console.log('If any checks failed, please verify the file paths and Java installation.');
    }, 5000);
  } else {
    console.log('❌ Cannot test SDK execution - JAR file not found');
  }
}, 1000); 