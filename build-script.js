#!/usr/bin/env node

/**
 * Netlify 自动构建脚本
 * 自动处理版本注入、文件版本化和资源更新
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 开始 Netlify 自动构建...');

class NetlifyBuildProcessor {
    constructor() {
        this.buildTime = new Date();
        this.version = this.generateVersion();
        this.buildId = process.env.BUILD_ID || 'local';
        this.deployId = process.env.DEPLOY_ID || 'local';
        this.commitRef = process.env.COMMIT_REF || 'unknown';
        this.branch = process.env.BRANCH || 'main';
        
        console.log(`📅 构建版本: ${this.version}`);
        console.log(`🔧 构建ID: ${this.buildId}`);
        console.log(`🌿 分支: ${this.branch}`);
        console.log(`📝 提交: ${this.commitRef}`);
    }

    /**
     * 生成版本号
     */
    generateVersion() {
        // 优先使用 Netlify 环境变量
        if (process.env.DEPLOY_ID) {
            return process.env.DEPLOY_ID.slice(0, 12);
        }
        
        // 使用构建时间戳
        return this.buildTime.toISOString()
            .replace(/[-:]/g, '')
            .replace('T', '')
            .slice(0, 14);
    }

    /**
     * 处理文件版本化
     */
    async processFiles() {
        console.log('📦 开始处理文件版本化...');

        // 处理 CSS 文件
        await this.versionizeFiles('*.css', (originalName, versionedName) => {
            console.log(`✅ CSS: ${originalName} → ${versionedName}`);
        });

        // 处理 JS 文件
        await this.versionizeFiles('js/*.js', (originalName, versionedName) => {
            console.log(`✅ JS: ${originalName} → ${versionedName}`);
        });

        // 更新 HTML 文件
        await this.updateHtmlReferences();

        // 生成版本信息文件
        await this.generateVersionFile();

        console.log('✅ 文件处理完成');
    }

    /**
     * 版本化文件
     */
    async versionizeFiles(pattern, callback) {
        const glob = require('glob');
        const files = glob.sync(pattern);

        for (const file of files) {
            if (file.includes('.min.') || file.includes(this.version)) {
                continue; // 跳过已处理的文件
            }

            const dir = path.dirname(file);
            const ext = path.extname(file);
            const basename = path.basename(file, ext);
            
            const versionedName = `${basename}.${this.version}${ext}`;
            const versionedPath = path.join(dir, versionedName);

            // 复制文件
            fs.copyFileSync(file, versionedPath);
            
            if (callback) {
                callback(file, versionedPath);
            }
        }
    }

    /**
     * 更新 HTML 文件中的引用
     */
    async updateHtmlReferences() {
        console.log('🔄 更新 HTML 文件引用...');

        const htmlFiles = ['code_generator.html'];
        
        for (const htmlFile of htmlFiles) {
            if (!fs.existsSync(htmlFile)) continue;

            let content = fs.readFileSync(htmlFile, 'utf8');

            // 替换版本占位符
            content = content.replace(/BUILD_VERSION_PLACEHOLDER/g, this.version);
            content = content.replace(/BUILD_TIME_PLACEHOLDER/g, this.buildTime.toISOString());

            // 更新 CSS 引用
            content = content.replace(
                /href="([^"]+\.css)"/g,
                (match, cssPath) => {
                    if (cssPath.includes(this.version)) return match;
                    const dir = path.dirname(cssPath);
                    const ext = path.extname(cssPath);
                    const basename = path.basename(cssPath, ext);
                    const versionedPath = dir === '.' ? 
                        `${basename}.${this.version}${ext}` : 
                        `${dir}/${basename}.${this.version}${ext}`;
                    return `href="${versionedPath}"`;
                }
            );

            // 更新 JS 引用
            content = content.replace(
                /src="([^"]+\.js)"/g,
                (match, jsPath) => {
                    if (jsPath.includes(this.version) || jsPath.startsWith('http')) return match;
                    const dir = path.dirname(jsPath);
                    const ext = path.extname(jsPath);
                    const basename = path.basename(jsPath, ext);
                    const versionedPath = dir === '.' ? 
                        `${basename}.${this.version}${ext}` : 
                        `${dir}/${basename}.${this.version}${ext}`;
                    return `src="${versionedPath}"`;
                }
            );

            fs.writeFileSync(htmlFile, content, 'utf8');
            console.log(`✅ 已更新: ${htmlFile}`);
        }
    }

    /**
     * 生成版本信息文件
     */
    async generateVersionFile() {
        console.log('📄 生成版本信息文件...');

        const versionInfo = {
            version: this.version,
            buildTime: this.buildTime.toISOString(),
            buildId: this.buildId,
            deployId: this.deployId,
            commitRef: this.commitRef,
            branch: this.branch,
            buildTool: 'netlify-auto-build',
            environment: process.env.CONTEXT || 'production'
        };

        // 生成 JSON 格式
        fs.writeFileSync('version.json', JSON.stringify(versionInfo, null, 2));

        // 生成文本格式
        const versionText = `# 蓝牙指令代码生成器 - 版本信息
部署时间: ${this.buildTime.toLocaleString('zh-CN')}
版本戳: ${this.version}
构建ID: ${this.buildId}
部署ID: ${this.deployId}
Git提交: ${this.commitRef}
Git分支: ${this.branch}
构建环境: ${process.env.CONTEXT || 'production'}
构建工具: Netlify 自动构建

# 自动生成的版本文件 - 用于版本检测
# 最后更新: ${this.buildTime.toISOString()}
`;

        fs.writeFileSync('VERSION.txt', versionText);

        console.log('✅ 版本信息文件已生成');
    }

    /**
     * 清理临时文件
     */
    async cleanup() {
        console.log('🧹 清理临时文件...');
        
        // 可以在这里添加清理逻辑
        // 例如删除未版本化的原始文件（可选）
        
        console.log('✅ 清理完成');
    }

    /**
     * 运行完整构建流程
     */
    async run() {
        try {
            console.log('🎯 开始自动构建流程...');
            
            await this.processFiles();
            await this.cleanup();
            
            console.log('🎉 构建成功完成！');
            console.log(`📊 构建统计:`);
            console.log(`   版本号: ${this.version}`);
            console.log(`   构建时间: ${this.buildTime.toLocaleString('zh-CN')}`);
            console.log(`   部署环境: ${process.env.CONTEXT || 'production'}`);
            
        } catch (error) {
            console.error('❌ 构建失败:', error);
            process.exit(1);
        }
    }
}

// 安装依赖检查
function checkDependencies() {
    try {
        require('glob');
    } catch (error) {
        console.log('📦 安装构建依赖...');
        const { execSync } = require('child_process');
        execSync('npm install glob', { stdio: 'inherit' });
    }
}

// 主执行流程
async function main() {
    console.log('🚀 Netlify 自动构建脚本启动');
    console.log('==========================================');
    
    // 检查并安装依赖
    checkDependencies();
    
    // 创建并运行构建处理器
    const processor = new NetlifyBuildProcessor();
    await processor.run();
    
    console.log('==========================================');
    console.log('✨ 构建脚本执行完成');
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('💥 构建脚本执行失败:', error);
        process.exit(1);
    });
}

module.exports = NetlifyBuildProcessor; 