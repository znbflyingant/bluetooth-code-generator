// Swift代码生成器

// 映射到Swift类型
function mapToSwiftType(kotlinType) {
    const typeMap = {
        'String': 'String?',
        'Int': 'Int32?',
        'Int3': 'Int32?',
        'Int2': 'Int16?',
        'Int1': 'UInt8?',
        'Long': 'Int64?',
        'Short': 'Int16?',
        'Byte': 'UInt8?',
        'Boolean': 'Bool?',
        'Float': 'Float?',
        'Double': 'Double?',
        'ByteArray': 'Data?',
        'MutableList<String>': '[String]?',
        'MutableList<Int>': '[Int32]?',
        'MutableList<Int3>': '[Int32]?',
        'MutableList<Int2>': '[Int16]?',
        'MutableList<Int1>': '[UInt8]?',
        'MutableList<Byte>': '[UInt8]?'
    };
    return typeMap[kotlinType] || 'Any?';
}

// 生成字段注释
function generateSwiftFieldComment(fieldType, field) {
    let comment = '';
    switch (fieldType) {
        case 'String':
            const stringLengthBytes = field.stringLengthBytes || 1;
            comment = `字符串字段 (${stringLengthBytes}字节长度前缀)`;
            break;
        case 'Int':
            comment = '32位整数字段';
            break;
        case 'Int3':
            comment = '24位整数字段';
            break;
        case 'Int2':
            comment = '16位整数字段';
            break;
        case 'Int1':
            comment = '8位整数字段';
            break;
        case 'Long':
            comment = '64位长整数字段';
            break;
        case 'Short':
            comment = '16位短整数字段';
            break;
        case 'Byte':
            comment = '8位字节字段';
            break;
        case 'Boolean':
            comment = '布尔字段';
            break;
        case 'Float':
            comment = '32位浮点数字段';
            break;
        case 'Double':
            comment = '64位双精度浮点数字段';
            break;
        case 'ByteArray':
            comment = '字节数组字段';
            break;
        default:
            comment = `${fieldType} 字段`;
            break;
    }
    return comment;
}

// 生成Swift类代码
function generateSwiftClassCode(className, fields = [], isReq = true, enumBaseName = '', enumType = 'AiResEnum') {
    let code = `import Foundation

/// 兼容Java CmdHelper的字节转换工具类
class ByteConverter {
    
    /// 字节转换为32位整数 (对应 CmdHelper.byteToInt)
    /// 使用大端序，与Java保持一致
    static func byteToInt(_ data: Data) -> Int32 {
        guard data.count >= 4 else {
            fatalError("Data length must be >= 4")
        }
        return data.withUnsafeBytes { bytes in
            let value = bytes.load(as: UInt32.self).bigEndian
            return Int32(bitPattern: value)
        }
    }
    
    /// 32位整数转换为字节 (对应 CmdHelper.intToByte)
    static func intToByte(_ value: Int32) -> Data {
        let bigEndianValue = UInt32(bitPattern: value).bigEndian
        return Data(bytes: &bigEndianValue, count: 4)
    }
    
    /// 字节转换为16位整数 (对应 CmdHelper.byte2ToInt)
    static func byte2ToInt(_ data: Data) -> Int16 {
        guard data.count >= 2 else {
            fatalError("Data length must be >= 2")
        }
        return data.withUnsafeBytes { bytes in
            let value = bytes.load(as: UInt16.self).bigEndian
            return Int16(bitPattern: value)
        }
    }
    
    /// 16位整数转换为字节 (对应 CmdHelper.intToByte2)
    static func intToByte2(_ value: Int16) -> Data {
        let bigEndianValue = UInt16(bitPattern: value).bigEndian
        return Data(bytes: &bigEndianValue, count: 2)
    }
    
    /// 字节转换为24位整数 (对应 CmdHelper.byte3ToInt)
    static func byte3ToInt(_ data: Data) -> Int32 {
        guard data.count >= 3 else {
            fatalError("Data length must be >= 3")
        }
        let bytes = Array(data.prefix(3))
        let value = (Int32(bytes[0]) << 16) | (Int32(bytes[1]) << 8) | Int32(bytes[2])
        return value
    }
    
    /// 24位整数转换为字节 (对应 CmdHelper.intToByte3)
    static func intToByte3(_ value: Int32) -> Data {
        let bytes: [UInt8] = [
            UInt8((value >> 16) & 0xFF),
            UInt8((value >> 8) & 0xFF),
            UInt8(value & 0xFF)
        ]
        return Data(bytes)
    }
    
    /// 字节转换为8位整数 (对应 CmdHelper.byte1ToInt)
    static func byte1ToInt(_ data: Data) -> UInt8 {
        guard !data.isEmpty else {
            fatalError("Data length must be >= 1")
        }
        return data[0]
    }
    
    /// 8位整数转换为字节 (对应 CmdHelper.intToByte1)
    static func intToByte1(_ value: UInt8) -> Data {
        return Data([value])
    }
    
    /// 字节转换为64位长整数 (对应 CmdHelper.byteToLong)
    static func byteToLong(_ data: Data) -> Int64 {
        guard data.count >= 8 else {
            fatalError("Data length must be >= 8")
        }
        return data.withUnsafeBytes { bytes in
            let value = bytes.load(as: UInt64.self).bigEndian
            return Int64(bitPattern: value)
        }
    }
    
    /// 64位长整数转换为字节 (对应 CmdHelper.longToByte)
    static func longToByte(_ value: Int64) -> Data {
        let bigEndianValue = UInt64(bitPattern: value).bigEndian
        return Data(bytes: &bigEndianValue, count: 8)
    }
    
    /// 字节转换为16位短整数 (对应 CmdHelper.byteToShort)
    static func byteToShort(_ data: Data) -> Int16 {
        return byte2ToInt(data)
    }
    
    /// 16位短整数转换为字节 (对应 CmdHelper.shortToByte)
    static func shortToByte(_ value: Int16) -> Data {
        return intToByte2(value)
    }
    
    /// 字节转换为32位浮点数 (对应 CmdHelper.byteToFloat)
    static func byteToFloat(_ data: Data) -> Float {
        guard data.count >= 4 else {
            fatalError("Data length must be >= 4")
        }
        return data.withUnsafeBytes { bytes in
            let value = bytes.load(as: UInt32.self).bigEndian
            return Float(bitPattern: value)
        }
    }
    
    /// 32位浮点数转换为字节 (对应 CmdHelper.floatToByte)
    static func floatToByte(_ value: Float) -> Data {
        let bigEndianValue = value.bitPattern.bigEndian
        return Data(bytes: &bigEndianValue, count: 4)
    }
    
    /// 字节转换为64位双精度浮点数 (对应 CmdHelper.byteToDouble)
    static func byteToDouble(_ data: Data) -> Double {
        guard data.count >= 8 else {
            fatalError("Data length must be >= 8")
        }
        return data.withUnsafeBytes { bytes in
            let value = bytes.load(as: UInt64.self).bigEndian
            return Double(bitPattern: value)
        }
    }
    
    /// 64位双精度浮点数转换为字节 (对应 CmdHelper.doubleToByte)
    static func doubleToByte(_ value: Double) -> Data {
        let bigEndianValue = value.bitPattern.bigEndian
        return Data(bytes: &bigEndianValue, count: 8)
    }
}

class ${className}: NSObject {
`;

    // 添加字段定义
    if (fields.length > 0) {
        fields.forEach(field => {
            const swiftType = mapToSwiftType(field.type);
            code += `    // ${generateSwiftFieldComment(field.type, field)}\n`;
            code += `    var ${field.name}: ${swiftType}\n\n`;
        });
    }

    // 添加构造函数
    code += `    override init() {\n`;
    if (fields.length > 0) {
        fields.forEach(field => {
            code += `        ${field.name} = nil\n`;
        });
    }
    code += `        super.init()\n`;
    code += `    }\n\n`;

    // 添加带参数的构造函数
    if (fields.length > 0) {
        code += `    init(`;
        fields.forEach((field, index) => {
            const swiftType = mapToSwiftType(field.type);
            code += `${field.name}: ${swiftType}`;
            if (index < fields.length - 1) code += ', ';
        });
        code += `) {\n`;
        fields.forEach(field => {
            code += `        self.${field.name} = ${field.name}\n`;
        });
        code += `        super.init()\n`;
        code += `    }\n\n`;
    }

    // 添加fromByteArray方法 (与Dart保持一致的命名)
    code += `    // 从字节数组反序列化 (兼容Kotlin CmdHelper)
    func fromByteArray(_ data: Data) {
        do {
            if !data.isEmpty {
`;

    if (fields.length > 0) {
        code += generateSwiftFromByteArrayCode(fields);
    }

    code += `            }
        } catch {
            print("fromByteArray error: \\(error)")
        }
    }

    // 序列化为字节数组 (兼容Kotlin CmdHelper)
    func toByteArray() -> Data {
        do {
`;

    if (fields.length > 0) {
        code += generateSwiftToByteArrayCode(fields);
    } else {
        code += `            return Data()`;
    }

    code += `
        } catch {
            print("toByteArray error: \\(error)")
            return Data()
        }
    }

    // 从JSON反序列化
    func fromJson(_ json: [String: Any]) {
        do {
`;

    if (fields.length > 0) {
        code += generateSwiftFromJsonCode(fields);
    }

    code += `        } catch {
            print("fromJson error: \\(error)")
        }
    }

    // 序列化为JSON
    func toJson() -> [String: Any] {
        do {
            var json: [String: Any] = [:]
`;

    if (fields.length > 0) {
        code += generateSwiftToJsonCode(fields);
    }

    code += `            return json
        } catch {
            print("toJson error: \\(error)")
            return [:]
        }
    }

    override var description: String {
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: toJson(), options: .prettyPrinted)
            return "json: \\(String(data: jsonData, encoding: .utf8) ?? "{}")"
        } catch {
            return "json: {}"
        }
    }
}`;

    return code;
}

// 生成Swift fromByteArray方法的具体实现 (兼容Kotlin CmdHelper)
function generateSwiftFromByteArrayCode(fields) {
    let code = '';
    let position = 0;
    
    fields.forEach((field, index) => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
                const stringLengthBytes = field.stringLengthBytes || 1;
                if (stringLengthBytes === 1) {
                    code += `                let ${fieldName}Size = Int(ByteConverter.byte1ToInt(data.subdata(in: ${position}..<${position + 1})))\n`;
                } else if (stringLengthBytes === 2) {
                    code += `                let ${fieldName}Size = Int(ByteConverter.byte2ToInt(data.subdata(in: ${position}..<${position + 2})))\n`;
                } else if (stringLengthBytes === 3) {
                    code += `                let ${fieldName}Size = Int(ByteConverter.byte3ToInt(data.subdata(in: ${position}..<${position + 3})))\n`;
                } else if (stringLengthBytes === 4) {
                    code += `                let ${fieldName}Size = Int(ByteConverter.byteToInt(data.subdata(in: ${position}..<${position + 4})))\n`;
                }
                code += `                if ${fieldName}Size > 0 {\n`;
                code += `                    let ${fieldName}Data = data.subdata(in: ${typeof position === 'string' ? `${position} + ${stringLengthBytes}` : `${position + stringLengthBytes}`}..<${typeof position === 'string' ? `${position} + ${stringLengthBytes}` : `${position + stringLengthBytes}`} + ${fieldName}Size)\n`;
                code += `                    ${fieldName} = String(data: ${fieldName}Data, encoding: .utf8)\n`;
                code += `                }\n`;
                position = `${typeof position === 'string' ? position : position} + ${stringLengthBytes} + ${fieldName}Size`;
                break;
                
            case 'Int':
                code += `                ${fieldName} = ByteConverter.byteToInt(data.subdata(in: ${position}..<${position + 4}))\n`;
                position = typeof position === 'string' ? `${position} + 4` : position + 4;
                break;
                
            case 'Int3':
                code += `                ${fieldName} = ByteConverter.byte3ToInt(data.subdata(in: ${position}..<${position + 3}))\n`;
                position = typeof position === 'string' ? `${position} + 3` : position + 3;
                break;
                
            case 'Int2':
                code += `                ${fieldName} = Int32(ByteConverter.byte2ToInt(data.subdata(in: ${position}..<${position + 2})))\n`;
                position = typeof position === 'string' ? `${position} + 2` : position + 2;
                break;
                
            case 'Int1':
                code += `                ${fieldName} = ByteConverter.byte1ToInt(data.subdata(in: ${position}..<${position + 1}))\n`;
                position = typeof position === 'string' ? `${position} + 1` : position + 1;
                break;
                
            case 'Long':
                code += `                ${fieldName} = ByteConverter.byteToLong(data.subdata(in: ${position}..<${position + 8}))\n`;
                position = typeof position === 'string' ? `${position} + 8` : position + 8;
                break;
                
            case 'Short':
                code += `                ${fieldName} = ByteConverter.byteToShort(data.subdata(in: ${position}..<${position + 2}))\n`;
                position = typeof position === 'string' ? `${position} + 2` : position + 2;
                break;
                
            case 'Byte':
                code += `                ${fieldName} = data[${position}]\n`;
                position = typeof position === 'string' ? `${position} + 1` : position + 1;
                break;
                
            case 'Boolean':
                code += `                ${fieldName} = data[${position}] != 0\n`;
                position = typeof position === 'string' ? `${position} + 1` : position + 1;
                break;
                
            case 'Float':
                code += `                ${fieldName} = ByteConverter.byteToFloat(data.subdata(in: ${position}..<${position + 4}))\n`;
                position = typeof position === 'string' ? `${position} + 4` : position + 4;
                break;
                
            case 'Double':
                code += `                ${fieldName} = ByteConverter.byteToDouble(data.subdata(in: ${position}..<${position + 8}))\n`;
                position = typeof position === 'string' ? `${position} + 8` : position + 8;
                break;
                
            case 'ByteArray':
                code += `                let ${fieldName}Size = Int(ByteConverter.byte1ToInt(data.subdata(in: ${position}..<${typeof position === 'string' ? `${position} + 1` : position + 1})))\n`;
                code += `                if ${fieldName}Size > 0 {\n`;
                code += `                    ${fieldName} = data.subdata(in: ${typeof position === 'string' ? `${position} + 1` : position + 1}..<${typeof position === 'string' ? `${position} + 1` : position + 1} + ${fieldName}Size)\n`;
                code += `                }\n`;
                position = `${position} + 1 + ${fieldName}Size`;
                break;

            case 'MutableList<String>':
                const stringListLengthBytes = field.stringLengthBytes || 1;
                code += `                let ${fieldName}Count = Int(ByteConverter.byte1ToInt(data.subdata(in: ${position}..<${typeof position === 'string' ? `${position} + 1` : position + 1})))\n`;
                code += `                ${fieldName} = []\n`;
                code += `                var ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1}\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                if (stringListLengthBytes === 1) {
                    code += `                    let strLen = Int(ByteConverter.byte1ToInt(data.subdata(in: ${fieldName}Position..<${fieldName}Position + 1)))\n`;
                } else if (stringListLengthBytes === 2) {
                    code += `                    let strLen = Int(ByteConverter.byte2ToInt(data.subdata(in: ${fieldName}Position..<${fieldName}Position + 2)))\n`;
                } else if (stringListLengthBytes === 3) {
                    code += `                    let strLen = Int(ByteConverter.byte3ToInt(data.subdata(in: ${fieldName}Position..<${fieldName}Position + 3)))\n`;
                } else if (stringListLengthBytes === 4) {
                    code += `                    let strLen = Int(ByteConverter.byteToInt(data.subdata(in: ${fieldName}Position..<${fieldName}Position + 4)))\n`;
                }
                code += `                    ${fieldName}Position += ${stringListLengthBytes}\n`;
                code += `                    if strLen > 0 {\n`;
                code += `                        let strData = data.subdata(in: ${fieldName}Position..<${fieldName}Position + strLen)\n`;
                code += `                        if let str = String(data: strData, encoding: .utf8) {\n`;
                code += `                            ${fieldName}?.append(str)\n`;
                code += `                        }\n`;
                code += `                        ${fieldName}Position += strLen\n`;
                code += `                    }\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int>':
                code += `                let ${fieldName}Count = Int(ByteConverter.byte1ToInt(data.subdata(in: ${position}..<${typeof position === 'string' ? `${position} + 1` : position + 1})))\n`;
                code += `                ${fieldName} = []\n`;
                code += `                var ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1}\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                code += `                    let value = ByteConverter.byteToInt(data.subdata(in: ${fieldName}Position..<${fieldName}Position + 4))\n`;
                code += `                    ${fieldName}?.append(value)\n`;
                code += `                    ${fieldName}Position += 4\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int3>':
                code += `                let ${fieldName}Count = Int(ByteConverter.byte1ToInt(data.subdata(in: ${position}..<${typeof position === 'string' ? `${position} + 1` : position + 1})))\n`;
                code += `                ${fieldName} = []\n`;
                code += `                var ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1}\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                code += `                    let value = ByteConverter.byte3ToInt(data.subdata(in: ${fieldName}Position..<${fieldName}Position + 3))\n`;
                code += `                    ${fieldName}?.append(value)\n`;
                code += `                    ${fieldName}Position += 3\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int2>':
                code += `                let ${fieldName}Count = Int(ByteConverter.byte1ToInt(data.subdata(in: ${position}..<${typeof position === 'string' ? `${position} + 1` : position + 1})))\n`;
                code += `                ${fieldName} = []\n`;
                code += `                var ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1}\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                code += `                    let value = Int32(ByteConverter.byte2ToInt(data.subdata(in: ${fieldName}Position..<${fieldName}Position + 2)))\n`;
                code += `                    ${fieldName}?.append(value)\n`;
                code += `                    ${fieldName}Position += 2\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Int1>':
                code += `                let ${fieldName}Count = Int(ByteConverter.byte1ToInt(data.subdata(in: ${position}..<${typeof position === 'string' ? `${position} + 1` : position + 1})))\n`;
                code += `                ${fieldName} = []\n`;
                code += `                var ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1}\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                code += `                    let value = ByteConverter.byte1ToInt(data.subdata(in: ${fieldName}Position..<${fieldName}Position + 1))\n`;
                code += `                    ${fieldName}?.append(value)\n`;
                code += `                    ${fieldName}Position += 1\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            case 'MutableList<Byte>':
                code += `                let ${fieldName}Count = Int(ByteConverter.byte1ToInt(data.subdata(in: ${position}..<${typeof position === 'string' ? `${position} + 1` : position + 1})))\n`;
                code += `                ${fieldName} = []\n`;
                code += `                var ${fieldName}Position = ${typeof position === 'string' ? `${position} + 1` : position + 1}\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                code += `                    ${fieldName}?.append(data[${fieldName}Position])\n`;
                code += `                    ${fieldName}Position += 1\n`;
                code += `                }\n`;
                position = `${fieldName}Position`;
                break;
                
            default:
                code += `                // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
        
        if (index < fields.length - 1) {
            code += `\n`;
        }
    });
    
    return code;
}

// 生成Swift toByteArray方法的具体实现 (兼容Kotlin CmdHelper)
function generateSwiftToByteArrayCode(fields) {
    let code = `            var data = Data()\n\n`;
    
    fields.forEach(field => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
                const stringLengthBytes = field.stringLengthBytes || 1;
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                let ${fieldName}Data = ${fieldName}.data(using: .utf8) ?? Data()\n`;
                if (stringLengthBytes === 1) {
                    code += `                data.append(ByteConverter.intToByte1(UInt8(${fieldName}Data.count)))\n`;
                } else if (stringLengthBytes === 2) {
                    code += `                data.append(ByteConverter.intToByte2(Int16(${fieldName}Data.count)))\n`;
                } else if (stringLengthBytes === 3) {
                    code += `                data.append(ByteConverter.intToByte3(Int32(${fieldName}Data.count)))\n`;
                } else if (stringLengthBytes === 4) {
                    code += `                data.append(ByteConverter.intToByte(Int32(${fieldName}Data.count)))\n`;
                }
                code += `                data.append(${fieldName}Data)\n`;
                code += `            } else {\n`;
                if (stringLengthBytes === 1) {
                    code += `                data.append(ByteConverter.intToByte1(0))\n`;
                } else if (stringLengthBytes === 2) {
                    code += `                data.append(ByteConverter.intToByte2(0))\n`;
                } else if (stringLengthBytes === 3) {
                    code += `                data.append(ByteConverter.intToByte3(0))\n`;
                } else if (stringLengthBytes === 4) {
                    code += `                data.append(ByteConverter.intToByte(0))\n`;
                }
                code += `            }\n`;
                break;
                
            case 'Int':
                code += `            data.append(ByteConverter.intToByte(${fieldName} ?? 0))\n`;
                break;
                
            case 'Int3':
                code += `            data.append(ByteConverter.intToByte3(${fieldName} ?? 0))\n`;
                break;
                
            case 'Int2':
                code += `            data.append(ByteConverter.intToByte2(Int16(${fieldName} ?? 0)))\n`;
                break;
                
            case 'Int1':
                code += `            data.append(ByteConverter.intToByte1(${fieldName} ?? 0))\n`;
                break;
                
            case 'Long':
                code += `            data.append(ByteConverter.longToByte(${fieldName} ?? 0))\n`;
                break;
                
            case 'Short':
                code += `            data.append(ByteConverter.shortToByte(${fieldName} ?? 0))\n`;
                break;
                
            case 'Byte':
                code += `            data.append(${fieldName} ?? 0)\n`;
                break;
                
            case 'Boolean':
                code += `            data.append((${fieldName} ?? false) ? 1 : 0)\n`;
                break;
                
            case 'Float':
                code += `            data.append(ByteConverter.floatToByte(${fieldName} ?? 0.0))\n`;
                break;
                
            case 'Double':
                code += `            data.append(ByteConverter.doubleToByte(${fieldName} ?? 0.0))\n`;
                break;
                
            case 'ByteArray':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.intToByte1(UInt8(${fieldName}.count)))\n`;
                code += `                data.append(${fieldName})\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.intToByte1(0))\n`;
                code += `            }\n`;
                break;

            case 'MutableList<String>':
                const stringListLengthBytes = field.stringLengthBytes || 1;
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.intToByte1(UInt8(${fieldName}.count)))\n`;
                code += `                for str in ${fieldName} {\n`;
                code += `                    let strData = str.data(using: .utf8) ?? Data()\n`;
                if (stringListLengthBytes === 1) {
                    code += `                    data.append(ByteConverter.intToByte1(UInt8(strData.count)))\n`;
                } else if (stringListLengthBytes === 2) {
                    code += `                    data.append(ByteConverter.intToByte2(Int16(strData.count)))\n`;
                } else if (stringListLengthBytes === 3) {
                    code += `                    data.append(ByteConverter.intToByte3(Int32(strData.count)))\n`;
                } else if (stringListLengthBytes === 4) {
                    code += `                    data.append(ByteConverter.intToByte(Int32(strData.count)))\n`;
                }
                code += `                    data.append(strData)\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.intToByte1(0))\n`;
                code += `            }\n`;
                break;
                
            case 'MutableList<Int>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.intToByte1(UInt8(${fieldName}.count)))\n`;
                code += `                for value in ${fieldName} {\n`;
                code += `                    data.append(ByteConverter.intToByte(value))\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.intToByte1(0))\n`;
                code += `            }\n`;
                break;
                
            case 'MutableList<Int3>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.intToByte1(UInt8(${fieldName}.count)))\n`;
                code += `                for value in ${fieldName} {\n`;
                code += `                    data.append(ByteConverter.intToByte3(value))\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.intToByte1(0))\n`;
                code += `            }\n`;
                break;
                
            case 'MutableList<Int2>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.intToByte1(UInt8(${fieldName}.count)))\n`;
                code += `                for value in ${fieldName} {\n`;
                code += `                    data.append(ByteConverter.intToByte2(Int16(value)))\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.intToByte1(0))\n`;
                code += `            }\n`;
                break;
                
            case 'MutableList<Int1>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.intToByte1(UInt8(${fieldName}.count)))\n`;
                code += `                for value in ${fieldName} {\n`;
                code += `                    data.append(ByteConverter.intToByte1(value))\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.intToByte1(0))\n`;
                code += `            }\n`;
                break;
                
            case 'MutableList<Byte>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.intToByte1(UInt8(${fieldName}.count)))\n`;
                code += `                for value in ${fieldName} {\n`;
                code += `                    data.append(value)\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.intToByte1(0))\n`;
                code += `            }\n`;
                break;
                
            default:
                code += `            // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
        
        code += `\n`;
    });
    
    code += `            return data`;
    
    return code;
}

// 生成Swift fromJson方法
function generateSwiftFromJsonCode(fields) {
    let code = '';
    
    fields.forEach(field => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
                code += `            ${fieldName} = json["${fieldName}"] as? String\n`;
                break;
            case 'Int':
            case 'Int3':
                code += `            if let value = json["${fieldName}"] as? NSNumber {\n`;
                code += `                ${fieldName} = value.int32Value\n`;
                code += `            }\n`;
                break;
            case 'Int2':
                code += `            if let value = json["${fieldName}"] as? NSNumber {\n`;
                code += `                ${fieldName} = value.int16Value\n`;
                code += `            }\n`;
                break;
            case 'Int1':
            case 'Byte':
                code += `            if let value = json["${fieldName}"] as? NSNumber {\n`;
                code += `                ${fieldName} = value.uint8Value\n`;
                code += `            }\n`;
                break;
            case 'Long':
                code += `            if let value = json["${fieldName}"] as? NSNumber {\n`;
                code += `                ${fieldName} = value.int64Value\n`;
                code += `            }\n`;
                break;
            case 'Short':
                code += `            if let value = json["${fieldName}"] as? NSNumber {\n`;
                code += `                ${fieldName} = value.int16Value\n`;
                code += `            }\n`;
                break;
            case 'Boolean':
                code += `            ${fieldName} = json["${fieldName}"] as? Bool\n`;
                break;
            case 'Float':
                code += `            if let value = json["${fieldName}"] as? NSNumber {\n`;
                code += `                ${fieldName} = value.floatValue\n`;
                code += `            }\n`;
                break;
            case 'Double':
                code += `            if let value = json["${fieldName}"] as? NSNumber {\n`;
                code += `                ${fieldName} = value.doubleValue\n`;
                code += `            }\n`;
                break;
            case 'ByteArray':
                code += `            if let base64String = json["${fieldName}"] as? String,\n`;
                code += `               let data = Data(base64Encoded: base64String) {\n`;
                code += `                ${fieldName} = data\n`;
                code += `            }\n`;
                break;
            case 'MutableList<String>':
                code += `            ${fieldName} = json["${fieldName}"] as? [String]\n`;
                break;
            case 'MutableList<Int>':
            case 'MutableList<Int3>':
                code += `            if let array = json["${fieldName}"] as? [NSNumber] {\n`;
                code += `                ${fieldName} = array.map { $0.int32Value }\n`;
                code += `            }\n`;
                break;
            case 'MutableList<Int2>':
                code += `            if let array = json["${fieldName}"] as? [NSNumber] {\n`;
                code += `                ${fieldName} = array.map { $0.int16Value }\n`;
                code += `            }\n`;
                break;
            case 'MutableList<Int1>':
            case 'MutableList<Byte>':
                code += `            if let array = json["${fieldName}"] as? [NSNumber] {\n`;
                code += `                ${fieldName} = array.map { $0.uint8Value }\n`;
                code += `            }\n`;
                break;
            default:
                code += `            // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
    });
    
    return code;
}

// 生成Swift toJson方法
function generateSwiftToJsonCode(fields) {
    let code = '';
    
    fields.forEach(field => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                json["${fieldName}"] = ${fieldName}\n`;
                code += `            }\n`;
                break;
            case 'Int':
            case 'Int3':
            case 'Int2':
            case 'Int1':
            case 'Long':
            case 'Short':
            case 'Byte':
            case 'Boolean':
            case 'Float':
            case 'Double':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                json["${fieldName}"] = ${fieldName}\n`;
                code += `            }\n`;
                break;
            case 'ByteArray':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                json["${fieldName}"] = ${fieldName}.base64EncodedString()\n`;
                code += `            }\n`;
                break;
            case 'MutableList<String>':
            case 'MutableList<Int>':
            case 'MutableList<Int3>':
            case 'MutableList<Int2>':
            case 'MutableList<Int1>':
            case 'MutableList<Byte>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                json["${fieldName}"] = ${fieldName}\n`;
                code += `            }\n`;
                break;
            default:
                code += `            // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
    });
    
    return code;
} 