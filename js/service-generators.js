// Service代码生成器

// 生成Client Service代码
function generateClientServiceCode(generateBoth, reqClassName, rspClassName, baseName) {
    const serviceName = document.getElementById('serviceName').value.trim() || 'AiResService';
    const clientServiceName = serviceName.replace('Service', 'ClientService');
    const servicePackage = document.getElementById('servicePackage').value.trim() || 'com.tempolor.aimusic.proto';
    const includeInChunk = document.getElementById('includeInChunk').checked;
    const includeWithResponse = document.getElementById('includeWithResponse').checked;
    
    let code = `object ${clientServiceName} {`;
    
    // 生成方法
    if (generateBoth) {
        // 生成Req和Rsp对应的方法
        if (reqClassName && includeInChunk) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            code += `\n    suspend fun ${methodName}ReqInChunk(${paramName}: ${reqClassName}): ${rspClassName} {\n`;
            code += `        val result = SendDataInChunksHelper.supReqInQueueEx(${paramName})\n`;
            code += `        return ${rspClassName}().apply {\n`;
            code += `            fromResponseWrap(result)\n`;
            code += `        }\n`;
            code += `    }\n`;
        }
        
        if (reqClassName && includeWithResponse) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            code += `\n    suspend fun ${methodName}ReqWithResponse(${paramName}: ${reqClassName}): ${rspClassName} {\n`;
            code += `        val result = SendDataWithResponseHelper.supReqInQueueEx(${paramName})\n`;
            code += `        return ${rspClassName}().apply {\n`;
            code += `            fromResponseWrap(result)\n`;
            code += `        }\n`;
            code += `    }\n`;
        }
    } else {
        // 单个生成模式
        if (reqClassName) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            
            if (includeInChunk) {
                code += `\n    suspend fun ${methodName}ReqInChunk(${paramName}: ${reqClassName}): ${rspClassName} {\n`;
                code += `        val result = SendDataInChunksHelper.supReqInQueueEx(${paramName})\n`;
                code += `        return ${rspClassName}().apply {\n`;
                code += `            fromResponseWrap(result)\n`;
                code += `        }\n`;
                code += `    }\n`;
            }
            
            if (includeWithResponse) {
                code += `\n    suspend fun ${methodName}ReqWithResponse(${paramName}: ${reqClassName}): ${rspClassName} {\n`;
                code += `        val result = SendDataWithResponseHelper.supReqInQueueEx(${paramName})\n`;
                code += `        return ${rspClassName}().apply {\n`;
                code += `            fromResponseWrap(result)\n`;
                code += `        }\n`;
                code += `    }\n`;
            }
        }
    }
    
    code += `\n}`;
    
    return code;
}

// 生成Server Service代码
function generateServerServiceCode(generateBoth, reqClassName, rspClassName, baseName) {
    const serviceName = document.getElementById('serviceName').value.trim() || 'AiResService';
    const serverServiceName = serviceName.replace('Service', 'ServerService');
    const includeServerSupReq = document.getElementById('includeServerSupReq').checked;
    const includeServerSendData = document.getElementById('includeServerSendData').checked;
    
    let code = `object ${serverServiceName} {`;
    
    // 生成方法
    if (generateBoth) {
        // 生成Req和Rsp对应的方法
        if (reqClassName && includeServerSupReq) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            code += `\n    suspend fun ${methodName}SupReqInQueueEx(${paramName}: ${reqClassName}): ${rspClassName} {\n`;
            code += `        val result = BleSendDataHelper.instance.supReqInQueueEx(${paramName})\n`;
                code += `        return ${rspClassName}().apply {\n`;
                code += `            fromResponseWrap(result)\n`;
                code += `        }\n`;
                code += `    }\n`;
        }
        
        if (reqClassName && includeServerSendData) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            code += `\n    suspend fun ${methodName}SendData(${paramName}: ${reqClassName}) {\n`;
            code += `        BleSendDataHelper.instance.sendData(${paramName})\n`;
            code += `    }\n`;
        }
    } else {
        // 单个生成模式
        if (reqClassName) {
            const methodName = toCamelCase(reqClassName.replace('Req', '')); // 去掉Req后缀并转为小写开头
            const paramName = toCamelCase(baseName) + 'Req';
            
            if (includeServerSupReq) {
                code += `\n    suspend fun ${methodName}SupReqInQueueEx(${paramName}: ${reqClassName}): Boolean {\n`;
                code += `        val result = BleSendDataHelper.instance.supReqInQueueEx(${paramName})\n`;
                code += `        return result?.errCode == ResponseResultCodeEnum.Success\n`;
                code += `    }\n`;
            }
            
            if (includeServerSendData) {
                code += `\n    suspend fun ${methodName}SendData(${paramName}: ${reqClassName}) {\n`;
                code += `        BleSendDataHelper.instance.sendData(${paramName})\n`;
                code += `    }\n`;
            }
        }
    }
    
    code += `\n}`;
    
    return code;
}

// 转换为驼峰命名法（首字母小写）
function toCamelCase(str) {
    if (!str) return 'defaultParam';
    
    // 如果已经是驼峰命名法，直接确保首字母小写
    if (/^[a-z][a-zA-Z0-9]*$/.test(str)) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }
    
    // 处理下划线、连字符等分隔符
    return str.toLowerCase()
        .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
        .replace(/^[A-Z]/, char => char.toLowerCase());
}

// 获取Service方法名称
function getServiceMethodName(baseName) {
    if (!baseName) return 'DefaultMethod';
    // 首字母大写
    return baseName.charAt(0).toUpperCase() + baseName.slice(1);
} 