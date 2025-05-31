# Complete ZATCA SDK Setup Guide

## What You Need to Copy

For full Phase 2 functionality with real cryptographic signatures and QR codes, you need these files from your ZATCA sandbox:

### Required Files:

1. **`zatca-einvoicing-sdk-238-R4.0.0.jar`** - The main SDK
2. **`config.json`** - SDK configuration
3. **Certificate files** (for production)

## Setup Option 1: In Your Project Root

### Step 1: Create Directory Structure

```bash
mkdir -p zatca/Apps
mkdir -p zatca/Configuration
mkdir -p zatca/Certificates
```

### Step 2: Copy Files

Copy these files from your existing ZATCA sandbox:

**From:** `C:\Users\IREE\Documents\GitHub\New folder\zatca-einvoicing-phase2-sandbox\`

**To Your Project:**

```
your-project/
├── zatca/
│   ├── Apps/
│   │   └── zatca-einvoicing-sdk-238-R4.0.0.jar
│   ├── Configuration/
│   │   └── config.json
│   └── Certificates/ (copy any .p12 or certificate files)
```

### Step 3: Update Your Environment Variables

Create a `.env.local` file in your project root:

```bash
# ZATCA SDK Configuration
ZATCA_SDK_JAR_PATH=./zatca/Apps/zatca-einvoicing-sdk-238-R4.0.0.jar
ZATCA_SDK_CONFIG_PATH=./zatca/Configuration/config.json
ZATCA_WORKING_DIR=./zatca
ZATCA_REQUIRE_SANDBOX=true
ZATCA_ALLOW_LOCAL_VALIDATION=true
```

### Step 4: Update Your Code Paths

Add these paths to the `findZatcaSdkPath()` function:

```typescript
async function findZatcaSdkPath(): Promise<string> {
  const possiblePaths = [
    // Project-relative paths (ADD THESE)
    path.resolve(
      process.cwd(),
      "zatca",
      "Apps",
      "zatca-einvoicing-sdk-238-R4.0.0.jar"
    ),
    path.resolve(
      process.cwd(),
      "..",
      "..",
      "zatca",
      "Apps",
      "zatca-einvoicing-sdk-238-R4.0.0.jar"
    ),

    // Existing paths...
    "C:\\Users\\IREE\\Documents\\GitHub\\New folder\\zatca-einvoicing-phase2-sandbox\\Apps\\zatca-einvoicing-sdk-238-R4.0.0.jar",
    // ... rest of existing paths
  ];
}
```

## Setup Option 2: Server Deployment

### For Vercel/Netlify (Static Deployment)

⚠️ **Note**: The ZATCA SDK requires Java runtime and file system access. This won't work on static hosting platforms.

### For Docker Deployment

```dockerfile
FROM node:18-alpine

# Install Java (required for ZATCA SDK)
RUN apk add --no-cache openjdk11-jre

# Copy your app
COPY . /app
WORKDIR /app

# Install dependencies
RUN npm install

# Copy ZATCA SDK files
COPY zatca/ /app/zatca/

# Set environment variables
ENV ZATCA_SDK_JAR_PATH=/app/zatca/Apps/zatca-einvoicing-sdk-238-R4.0.0.jar
ENV ZATCA_SDK_CONFIG_PATH=/app/zatca/Configuration/config.json
ENV ZATCA_WORKING_DIR=/app/zatca

# Make JAR executable
RUN chmod +x /app/zatca/Apps/zatca-einvoicing-sdk-238-R4.0.0.jar

EXPOSE 3000
CMD ["npm", "start"]
```

### For Traditional Server (VPS/Dedicated)

```bash
# Create ZATCA directory
sudo mkdir -p /opt/zatca/Apps
sudo mkdir -p /opt/zatca/Configuration

# Copy files to server
scp -r zatca/* user@your-server:/opt/zatca/

# Set permissions
sudo chmod +x /opt/zatca/Apps/zatca-einvoicing-sdk-238-R4.0.0.jar

# Set environment variables in your deployment
export ZATCA_SDK_JAR_PATH=/opt/zatca/Apps/zatca-einvoicing-sdk-238-R4.0.0.jar
export ZATCA_SDK_CONFIG_PATH=/opt/zatca/Configuration/config.json
export ZATCA_WORKING_DIR=/opt/zatca
```

## Important Requirements

### 1. Java Runtime

Your deployment environment needs Java 11 or higher:

```bash
# Check Java version
java -version

# Install Java if needed (Ubuntu/Debian)
sudo apt update
sudo apt install openjdk-11-jre

# Install Java (Alpine Docker)
RUN apk add --no-cache openjdk11-jre
```

### 2. File System Access

The ZATCA SDK needs to:

- Read/write temporary files
- Execute the JAR file
- Access configuration files

### 3. Memory Requirements

The SDK can be memory-intensive. Ensure your deployment has at least:

- **512MB RAM** minimum
- **1GB RAM** recommended

## Testing Your Setup

### 1. Test SDK Availability

```javascript
// Test API endpoint
const response = await fetch("/api/zatca/process", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    xmlContent: yourTestXml,
    mode: "sandbox",
  }),
});

const result = await response.json();
console.log("Mode used:", result.mode); // Should be 'sandbox'
```

### 2. Check Console Logs

Look for these success messages:

```
✅ ZATCA Sandbox is available
Found ZATCA SDK at: /path/to/zatca-einvoicing-sdk-238-R4.0.0.jar
Found ZATCA config at: /path/to/config.json
🔧 Using sandbox mode for ZATCA processing
```

## Troubleshooting

### Common Issues:

1. **"Java not found"**

   - Install Java runtime on your server
   - Ensure `java` command is in PATH

2. **"JAR file not executable"**

   - Run: `chmod +x /path/to/zatca-einvoicing-sdk-238-R4.0.0.jar`

3. **"Config file not found"**

   - Verify the `config.json` path is correct
   - Check file permissions

4. **"SDK timeout"**
   - Increase server memory
   - Check network connectivity if SDK makes external calls

## Production Considerations

### For Production ZATCA Integration:

1. **Replace sandbox certificates** with production ones
2. **Update config.json** with production endpoints
3. **Implement proper error handling** for SDK failures
4. **Set up monitoring** for SDK performance
5. **Backup certificate files** securely

### Security:

- Store certificates securely (not in version control)
- Use environment variables for sensitive config
- Restrict file system access to ZATCA directory
- Implement proper logging (without exposing sensitive data)
