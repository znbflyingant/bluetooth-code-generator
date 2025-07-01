/**
 * Netlify Functions - 版本检查 API
 * 提供实时版本信息查询
 */

const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    };

    // 处理 OPTIONS 请求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // 获取版本信息
        const versionInfo = getVersionInfo();
        
        // 添加实时信息
        const response = {
            ...versionInfo,
            serverTime: new Date().toISOString(),
            requestId: context.awsRequestId || 'local',
            region: process.env.AWS_REGION || 'unknown',
            functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION || '1.0'
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response, null, 2)
        };

    } catch (error) {
        console.error('版本检查 API 错误:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: '版本信息获取失败',
                timestamp: new Date().toISOString()
            })
        };
    }
};

/**
 * 获取版本信息
 */
function getVersionInfo() {
    // 尝试读取 version.json
    try {
        const versionJsonPath = path.join(process.cwd(), 'version.json');
        if (fs.existsSync(versionJsonPath)) {
            const versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
            return versionData;
        }
    } catch (error) {
        console.log('读取 version.json 失败:', error.message);
    }

    // 尝试读取 VERSION.txt
    try {
        const versionTxtPath = path.join(process.cwd(), 'VERSION.txt');
        if (fs.existsSync(versionTxtPath)) {
            const versionText = fs.readFileSync(versionTxtPath, 'utf8');
            const versionMatch = versionText.match(/版本戳:\s*([^\n]+)/);
            const buildTimeMatch = versionText.match(/部署时间:\s*([^\n]+)/);
            
            return {
                version: versionMatch ? versionMatch[1].trim() : 'unknown',
                buildTime: buildTimeMatch ? buildTimeMatch[1].trim() : 'unknown',
                source: 'VERSION.txt'
            };
        }
    } catch (error) {
        console.log('读取 VERSION.txt 失败:', error.message);
    }

    // 使用环境变量作为后备
    return {
        version: process.env.DEPLOY_ID || process.env.BUILD_ID || Date.now().toString(),
        buildTime: new Date().toISOString(),
        deployId: process.env.DEPLOY_ID || 'unknown',
        buildId: process.env.BUILD_ID || 'unknown',
        commitRef: process.env.COMMIT_REF || 'unknown',
        branch: process.env.BRANCH || 'main',
        environment: process.env.CONTEXT || 'production',
        source: 'environment-variables'
    };
} 