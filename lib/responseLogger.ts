/**
 * Response Logger Utility
 * Logs API responses to individual text files for debugging
 */

import fs from 'fs'
import path from 'path'

const LOGS_DIR = path.join(process.cwd(), 'logs')

/**
 * Ensure logs directory exists
 */
function ensureLogsDirectory() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true })
  }
}

/**
 * Log API response to a text file
 * @param apiName - Name of the API (e.g., 'create-shopify-order')
 * @param response - Response data
 * @param requestBody - Request body (optional)
 */
export async function logResponse(
  apiName: string,
  response: any,
  requestBody?: any
): Promise<void> {
  try {
    ensureLogsDirectory()

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `${apiName}_${timestamp}.txt`
    const filePath = path.join(LOGS_DIR, fileName)

    let content = `
╔════════════════════════════════════════════════════════════════╗
║                     API RESPONSE LOG                           ║
╚════════════════════════════════════════════════════════════════╝

API Name: ${apiName}
Timestamp: ${new Date().toISOString()}
File: ${fileName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`

    if (requestBody) {
      content += `REQUEST BODY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(requestBody, null, 2)}

`
    }

    content += `RESPONSE DATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(response, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
End of Log
`

    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`✅ Response logged to: ${filePath}`)
  } catch (error) {
    console.error('❌ Failed to log response:', error)
  }
}

/**
 * Log error response to a text file
 * @param apiName - Name of the API
 * @param error - Error object
 * @param requestBody - Request body (optional)
 */
export async function logErrorResponse(
  apiName: string,
  error: any,
  requestBody?: any
): Promise<void> {
  try {
    ensureLogsDirectory()

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `${apiName}_ERROR_${timestamp}.txt`
    const filePath = path.join(LOGS_DIR, fileName)

    let content = `
╔════════════════════════════════════════════════════════════════╗
║                   API ERROR LOG                                ║
╚════════════════════════════════════════════════════════════════╝

API Name: ${apiName}
Timestamp: ${new Date().toISOString()}
File: ${fileName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`

    if (requestBody) {
      content += `REQUEST BODY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(requestBody, null, 2)}

`
    }

    content += `ERROR DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${error?.name || 'Unknown'}
Message: ${error?.message || 'No message'}
Stack: ${error?.stack || 'No stack trace'}

Full Error:
${JSON.stringify(error, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
End of Log
`

    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`❌ Error logged to: ${filePath}`)
  } catch (error) {
    console.error('❌ Failed to log error response:', error)
  }
}
