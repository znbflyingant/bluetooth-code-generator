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
        'MutableList<Byte>': '[UInt8]?',
        'MutableList<ByteArray>': '[Data]?'
    };
    return typeMap[kotlinType] || 'Any?';
}

// 生成ByteConverter类（小端序处理，兼容Kotlin CmdHelper）
function generateSwiftByteConverter() {
    return `
// ByteConverter - 字节转换工具类 (小端序处理，兼容Kotlin CmdHelper)
class ByteConverter {
    
    // MARK: - 字节转换为数值（用于字段值）
    
    // 1字节转Int (UInt8)
    static func byte1ToInt(_ data: Data) -> UInt8 {
        guard data.count >= 1 else { return 0 }
        return data[0]
    }
    
    // 2字节转Int (有符号，小端序)
    static func byte2ToInt(_ data: Data) -> Int16 {
        guard data.count >= 2 else { return 0 }
        let value = data.withUnsafeBytes { bytes in
            bytes.load(fromByteOffset: 0, as: UInt16.self)
        }
        return Int16(bitPattern: UInt16(littleEndian: value))
    }
    
    // 3字节转Int (有符号，小端序)
    static func byte3ToInt(_ data: Data) -> Int32 {
        guard data.count >= 3 else { return 0 }
        var bytes = data
        bytes.append(0) // 补充第4个字节
        let value = bytes.withUnsafeBytes { bytesPtr in
            bytesPtr.load(fromByteOffset: 0, as: UInt32.self)
        }
        return Int32(bitPattern: UInt32(littleEndian: value))
    }
    
    // 4字节转Int (有符号，小端序)
    static func byteToInt(_ data: Data) -> Int32 {
        guard data.count >= 4 else { return 0 }
        let value = data.withUnsafeBytes { bytes in
            bytes.load(fromByteOffset: 0, as: UInt32.self)
        }
        return Int32(bitPattern: UInt32(littleEndian: value))
    }
    
    // 8字节转Long (有符号，小端序)
    static func byteToLong(_ data: Data) -> Int64 {
        guard data.count >= 8 else { return 0 }
        let value = data.withUnsafeBytes { bytes in
            bytes.load(fromByteOffset: 0, as: UInt64.self)
        }
        return Int64(bitPattern: UInt64(littleEndian: value))
    }
    
    // 2字节转Short (有符号，小端序)
    static func byteToShort(_ data: Data) -> Int16 {
        return byte2ToInt(data)
    }
    
    // 4字节转Float (小端序)
    static func byteToFloat(_ data: Data) -> Float {
        guard data.count >= 4 else { return 0.0 }
        let value = data.withUnsafeBytes { bytes in
            bytes.load(fromByteOffset: 0, as: UInt32.self)
        }
        let littleEndianValue = UInt32(littleEndian: value)
        return Float(bitPattern: littleEndianValue)
    }
    
    // 8字节转Double (小端序)
    static func byteToDouble(_ data: Data) -> Double {
        guard data.count >= 8 else { return 0.0 }
        let value = data.withUnsafeBytes { bytes in
            bytes.load(fromByteOffset: 0, as: UInt64.self)
        }
        let littleEndianValue = UInt64(littleEndian: value)
        return Double(bitPattern: littleEndianValue)
    }
    
    // MARK: - 字节转换为长度值（无符号，用于size/count字段）
    
    // 1字节转长度 (无符号)
    static func byte1ToSize(_ data: Data) -> Int {
        guard data.count >= 1 else { return 0 }
        return Int(data[0])
    }
    
    // 2字节转长度 (无符号，小端序)
    static func byte2ToSize(_ data: Data) -> Int {
        guard data.count >= 2 else { return 0 }
        let value = data.withUnsafeBytes { bytes in
            bytes.load(fromByteOffset: 0, as: UInt16.self)
        }
        return Int(UInt16(littleEndian: value))
    }
    
    // 3字节转长度 (无符号，小端序)
    static func byte3ToSize(_ data: Data) -> Int {
        guard data.count >= 3 else { return 0 }
        var bytes = data
        bytes.append(0) // 补充第4个字节
        let value = bytes.withUnsafeBytes { bytesPtr in
            bytesPtr.load(fromByteOffset: 0, as: UInt32.self)
        }
        return Int(UInt32(littleEndian: value))
    }
    
    // 4字节转长度 (无符号，小端序)
    static func byteToSize(_ data: Data) -> Int {
        guard data.count >= 4 else { return 0 }
        let value = data.withUnsafeBytes { bytes in
            bytes.load(fromByteOffset: 0, as: UInt32.self)
        }
        return Int(UInt32(littleEndian: value))
    }
    
    // MARK: - 数值转换为字节
    
    // UInt8转1字节
    static func intToByte1(_ value: UInt8) -> Data {
        return Data([value])
    }
    
    // Int16转2字节 (小端序)
    static func intToByte2(_ value: Int16) -> Data {
        let littleEndianValue = UInt16(bitPattern: value).littleEndian
        return withUnsafeBytes(of: littleEndianValue) { Data($0) }
    }
    
    // Int32转3字节 (小端序)
    static func intToByte3(_ value: Int32) -> Data {
        let littleEndianValue = UInt32(bitPattern: value).littleEndian
        return withUnsafeBytes(of: littleEndianValue) { Data($0.prefix(3)) }
    }
    
    // Int32转4字节 (小端序)
    static func intToByte(_ value: Int32) -> Data {
        let littleEndianValue = UInt32(bitPattern: value).littleEndian
        return withUnsafeBytes(of: littleEndianValue) { Data($0) }
    }
    
    // Int64转8字节 (小端序)
    static func longToByte(_ value: Int64) -> Data {
        let littleEndianValue = UInt64(bitPattern: value).littleEndian
        return withUnsafeBytes(of: littleEndianValue) { Data($0) }
    }
    
    // Int16转2字节 (小端序)
    static func shortToByte(_ value: Int16) -> Data {
        return intToByte2(value)
    }
    
    // Float转4字节 (小端序)
    static func floatToByte(_ value: Float) -> Data {
        let littleEndianValue = value.bitPattern.littleEndian
        return withUnsafeBytes(of: littleEndianValue) { Data($0) }
    }
    
    // Double转8字节 (小端序)
    static func doubleToByte(_ value: Double) -> Data {
        let littleEndianValue = value.bitPattern.littleEndian
        return withUnsafeBytes(of: littleEndianValue) { Data($0) }
    }
    
    // MARK: - 长度值转换为字节（用于size/count字段）
    
    // 长度转1字节
    static func sizeToByte1(_ value: Int) -> Data {
        return Data([UInt8(max(0, min(255, value)))])
    }
    
    // 长度转2字节 (小端序)
    static func sizeToByte2(_ value: Int) -> Data {
        let clampedValue = UInt16(max(0, min(65535, value)))
        let littleEndianValue = clampedValue.littleEndian
        return withUnsafeBytes(of: littleEndianValue) { Data($0) }
    }
    
    // 长度转3字节 (小端序)
    static func sizeToByte3(_ value: Int) -> Data {
        let clampedValue = UInt32(max(0, min(16777215, value))) // 2^24 - 1
        let littleEndianValue = clampedValue.littleEndian
        return withUnsafeBytes(of: littleEndianValue) { Data($0.prefix(3)) }
    }
    
    // 长度转4字节 (小端序)
    static func sizeToByteInt(_ value: Int) -> Data {
        let clampedValue = UInt32(max(0, value))
        let littleEndianValue = clampedValue.littleEndian
        return withUnsafeBytes(of: littleEndianValue) { Data($0) }
    }
    
    // MARK: - 辅助方法
    
    // 数据验证和调试
    static func validateData(_ data: Data, expectedSize: Int, description: String = "") -> Bool {
        let isValid = data.count == expectedSize
        if !isValid {
            print("ByteConverter Warning: \\(description) expected \\(expectedSize) bytes, got \\(data.count)")
        }
        return isValid
    }
}`;
}

// 生成独立的ByteConverter Swift文件
function generateSwiftByteConverterFile() {
    return `import Foundation
${generateSwiftByteConverter()}`;
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
    let position = 'position';
    code += `            var position = 0\n`;
    
    fields.forEach((field, index) => {
        const fieldName = field.name;
        const fieldType = field.type;
        
        switch (fieldType) {
            case 'String':
                const stringLengthBytes = field.stringLengthBytes || 1;
                if (stringLengthBytes === 1) {
                    code += `                let ${fieldName}Size = ByteConverter.byte1ToSize(data.subdata(in: position..<position + 1))\n`;
                } else if (stringLengthBytes === 2) {
                    code += `                let ${fieldName}Size = ByteConverter.byte2ToSize(data.subdata(in: position..<position + 2))\n`;
                } else if (stringLengthBytes === 3) {
                    code += `                let ${fieldName}Size = ByteConverter.byte3ToSize(data.subdata(in: position..<position + 3))\n`;
                } else if (stringLengthBytes === 4) {
                    code += `                let ${fieldName}Size = ByteConverter.byteToSize(data.subdata(in: position..<position + 4))\n`;
                }
                code += `                position += ${stringLengthBytes}\n`;
                code += `                if ${fieldName}Size > 0 {\n`;
                code += `                    let ${fieldName}Data = data.subdata(in: position..<position + ${fieldName}Size)\n`;
                code += `                    ${fieldName} = String(data: ${fieldName}Data, encoding: .utf8)\n`;
                code += `                    position += ${fieldName}Size\n`;
                code += `                }\n`;
                break;
                
            case 'Int':
                code += `                ${fieldName} = ByteConverter.byteToInt(data.subdata(in: position..<position + 4))\n`;
                code += `                position += 4\n`;
                break;
                
            case 'Int3':
                code += `                ${fieldName} = ByteConverter.byte3ToInt(data.subdata(in: position..<position + 3))\n`;
                code += `                position += 3\n`;
                break;
                
            case 'Int2':
                code += `                ${fieldName} = ByteConverter.byte2ToInt(data.subdata(in: position..<position + 2))\n`;
                code += `                position += 2\n`;
                break;
                
            case 'Int1':
                code += `                ${fieldName} = ByteConverter.byte1ToInt(data.subdata(in: position..<position + 1))\n`;
                code += `                position += 1\n`;
                break;
                
            case 'Long':
                code += `                ${fieldName} = ByteConverter.byteToLong(data.subdata(in: position..<position + 8))\n`;
                code += `                position += 8\n`;
                break;
                
            case 'Short':
                code += `                ${fieldName} = ByteConverter.byteToShort(data.subdata(in: position..<position + 2))\n`;
                code += `                position += 2\n`;
                break;
                
            case 'Byte':
                code += `                ${fieldName} = data[position]\n`;
                code += `                position += 1\n`;
                break;
                
            case 'Boolean':
                code += `                ${fieldName} = data[position] != 0\n`;
                code += `                position += 1\n`;
                break;
                
            case 'Float':
                code += `                ${fieldName} = ByteConverter.byteToFloat(data.subdata(in: position..<position + 4))\n`;
                code += `                position += 4\n`;
                break;
                
            case 'Double':
                code += `                ${fieldName} = ByteConverter.byteToDouble(data.subdata(in: position..<position + 8))\n`;
                code += `                position += 8\n`;
                break;
                
            case 'ByteArray':
                code += `                let ${fieldName}Size = ByteConverter.byte1ToSize(data.subdata(in: position..<position + 1))\n`;
                code += `                position += 1\n`;
                code += `                if ${fieldName}Size > 0 {\n`;
                code += `                    ${fieldName} = data.subdata(in: position..<position + ${fieldName}Size)\n`;
                code += `                    position += ${fieldName}Size\n`;
                code += `                }\n`;
                break;

            case 'MutableList<String>':
                const stringListLengthBytes = field.stringLengthBytes || 1;
                code += `                let ${fieldName}Count = ByteConverter.byte1ToSize(data.subdata(in: position..<position + 1))\n`;
                code += `                position += 1\n`;
                code += `                ${fieldName} = []\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                if (stringListLengthBytes === 1) {
                    code += `                    let strLen = ByteConverter.byte1ToSize(data.subdata(in: position..<position + 1))\n`;
                } else if (stringListLengthBytes === 2) {
                    code += `                    let strLen = ByteConverter.byte2ToSize(data.subdata(in: position..<position + 2))\n`;
                } else if (stringListLengthBytes === 3) {
                    code += `                    let strLen = ByteConverter.byte3ToSize(data.subdata(in: position..<position + 3))\n`;
                } else if (stringListLengthBytes === 4) {
                    code += `                    let strLen = ByteConverter.byteToSize(data.subdata(in: position..<position + 4))\n`;
                }
                code += `                    position += ${stringListLengthBytes}\n`;
                code += `                    if strLen > 0 {\n`;
                code += `                        let strData = data.subdata(in: position..<position + strLen)\n`;
                code += `                        if let str = String(data: strData, encoding: .utf8) {\n`;
                code += `                            ${fieldName}?.append(str)\n`;
                code += `                        }\n`;
                code += `                        position += strLen\n`;
                code += `                    }\n`;
                code += `                }\n`;
                break;
                
            case 'MutableList<Int>':
                code += `                let ${fieldName}Count = ByteConverter.byte1ToSize(data.subdata(in: position..<position + 1))\n`;
                code += `                position += 1\n`;
                code += `                ${fieldName} = []\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                code += `                    let value = ByteConverter.byteToInt(data.subdata(in: position..<position + 4))\n`;
                code += `                    ${fieldName}?.append(value)\n`;
                code += `                    position += 4\n`;
                code += `                }\n`;
                break;
                
            case 'MutableList<Int3>':
                code += `                let ${fieldName}Count = ByteConverter.byte1ToSize(data.subdata(in: position..<position + 1))\n`;
                code += `                position += 1\n`;
                code += `                ${fieldName} = []\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                code += `                    let value = ByteConverter.byte3ToInt(data.subdata(in: position..<position + 3))\n`;
                code += `                    ${fieldName}?.append(value)\n`;
                code += `                    position += 3\n`;
                code += `                }\n`;
                break;
                
            case 'MutableList<Int2>':
                code += `                let ${fieldName}Count = ByteConverter.byte1ToSize(data.subdata(in: position..<position + 1))\n`;
                code += `                position += 1\n`;
                code += `                ${fieldName} = []\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                code += `                    let value = ByteConverter.byte2ToInt(data.subdata(in: position..<position + 2))\n`;
                code += `                    ${fieldName}?.append(value)\n`;
                code += `                    position += 2\n`;
                code += `                }\n`;
                break;
                
            case 'MutableList<Int1>':
                code += `                let ${fieldName}Count = ByteConverter.byte1ToSize(data.subdata(in: position..<position + 1))\n`;
                code += `                position += 1\n`;
                code += `                ${fieldName} = []\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                code += `                    let value = ByteConverter.byte1ToInt(data.subdata(in: position..<position + 1))\n`;
                code += `                    ${fieldName}?.append(value)\n`;
                code += `                    position += 1\n`;
                code += `                }\n`;
                break;
                
            case 'MutableList<Byte>':
                code += `                let ${fieldName}Count = ByteConverter.byte1ToSize(data.subdata(in: position..<position + 1))\n`;
                code += `                position += 1\n`;
                code += `                ${fieldName} = []\n`;
                code += `                for _ in 0..<${fieldName}Count {\n`;
                code += `                    ${fieldName}?.append(data[position])\n`;
                code += `                    position += 1\n`;
                code += `                }\n`;
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
                    code += `                data.append(ByteConverter.sizeToByte1(${fieldName}Data.count))\n`;
                } else if (stringLengthBytes === 2) {
                    code += `                data.append(ByteConverter.sizeToByte2(${fieldName}Data.count))\n`;
                } else if (stringLengthBytes === 3) {
                    code += `                data.append(ByteConverter.sizeToByte3(${fieldName}Data.count))\n`;
                } else if (stringLengthBytes === 4) {
                    code += `                data.append(ByteConverter.sizeToByteInt(${fieldName}Data.count))\n`;
                }
                code += `                data.append(${fieldName}Data)\n`;
                code += `            } else {\n`;
                if (stringLengthBytes === 1) {
                    code += `                data.append(ByteConverter.sizeToByte1(0))\n`;
                } else if (stringLengthBytes === 2) {
                    code += `                data.append(ByteConverter.sizeToByte2(0))\n`;
                } else if (stringLengthBytes === 3) {
                    code += `                data.append(ByteConverter.sizeToByte3(0))\n`;
                } else if (stringLengthBytes === 4) {
                    code += `                data.append(ByteConverter.sizeToByteInt(0))\n`;
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
                code += `            data.append(ByteConverter.intToByte2(${fieldName} ?? 0))\n`;
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
                code += `                data.append(ByteConverter.sizeToByte1(${fieldName}.count))\n`;
                code += `                data.append(${fieldName})\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(0))\n`;
                code += `            }\n`;
                break;

            case 'MutableList<String>':
                const stringListLengthBytes = field.stringLengthBytes || 1;
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(${fieldName}.count))\n`;
                code += `                for str in ${fieldName} {\n`;
                code += `                    let strData = str.data(using: .utf8) ?? Data()\n`;
                if (stringListLengthBytes === 1) {
                    code += `                    data.append(ByteConverter.sizeToByte1(strData.count))\n`;
                } else if (stringListLengthBytes === 2) {
                    code += `                    data.append(ByteConverter.sizeToByte2(strData.count))\n`;
                } else if (stringListLengthBytes === 3) {
                    code += `                    data.append(ByteConverter.sizeToByte3(strData.count))\n`;
                } else if (stringListLengthBytes === 4) {
                    code += `                    data.append(ByteConverter.sizeToByteInt(strData.count))\n`;
                }
                code += `                    data.append(strData)\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(0))\n`;
                code += `            }\n`;
                break;
                
            case 'MutableList<Int>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(${fieldName}.count))\n`;
                code += `                for value in ${fieldName} {\n`;
                code += `                    data.append(ByteConverter.intToByte(value))\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(0))\n`;
                code += `            }\n`;
                break;
                
            case 'MutableList<Int3>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(${fieldName}.count))\n`;
                code += `                for value in ${fieldName} {\n`;
                code += `                    data.append(ByteConverter.intToByte3(value))\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(0))\n`;
                code += `            }\n`;
                break;
                
            case 'MutableList<Int2>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(${fieldName}.count))\n`;
                code += `                for value in ${fieldName} {\n`;
                code += `                    data.append(ByteConverter.intToByte2(value))\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(0))\n`;
                code += `            }\n`;
                break;
                
            case 'MutableList<Int1>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(${fieldName}.count))\n`;
                code += `                for value in ${fieldName} {\n`;
                code += `                    data.append(ByteConverter.intToByte1(value))\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(0))\n`;
                code += `            }\n`;
                break;
                
            case 'MutableList<Byte>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(${fieldName}.count))\n`;
                code += `                for value in ${fieldName} {\n`;
                code += `                    data.append(value)\n`;
                code += `                }\n`;
                code += `            } else {\n`;
                code += `                data.append(ByteConverter.sizeToByte1(0))\n`;
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
            case 'MutableList<ByteArray>':
                code += `            if let base64Array = json["${fieldName}"] as? [String] {\n`;
                code += `                ${fieldName} = base64Array.compactMap { Data(base64Encoded: $0) }\n`;
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
            case 'MutableList<ByteArray>':
                code += `            if let ${fieldName} = ${fieldName} {\n`;
                code += `                json["${fieldName}"] = ${fieldName}.map { $0.base64EncodedString() }\n`;
                code += `            }\n`;
                break;
            default:
                code += `            // TODO: 处理 ${fieldType} 类型的 ${fieldName} 字段\n`;
                break;
        }
    });
    
    return code;
} 