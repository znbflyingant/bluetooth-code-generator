/**
 * 版本管理器 - 用于检测版本更新并强制刷新
 * 蓝牙指令代码生成器
 */

class VersionManager {
    constructor() {
        this.currentVersion = this.getCurrentVersion();
        this.versionKey = 'app_version';
        this.versionCheckInterval = 30000; // 30秒检查一次
        this.lastVersionCheckKey = 'last_version_check';
        
        console.log('🔄 版本管理器初始化，当前版本:', this.currentVersion);
        this.init();
    }

    /**
     * 获取当前版本号（从构建时间戳或Git信息）
     */
    getCurrentVersion() {
        // 方法1: 从HTML meta标签获取
        const metaVersion = document.querySelector('meta[name="app-version"]');
        if (metaVersion) {
            return metaVersion.content;
        }

        // 方法2: 从当前时间戳生成（开发时使用）
        const buildTime = document.querySelector('meta[name="build-time"]');
        if (buildTime) {
            return buildTime.content;
        }

        // 方法3: 使用当前日期作为版本（备用方案）
        return new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '');
    }

    /**
     * 初始化版本管理
     */
    init() {
        this.checkStoredVersion();
        this.startVersionCheck();
        this.addVersionInfo();
    }

    /**
     * 检查本地存储的版本
     */
    checkStoredVersion() {
        const storedVersion = localStorage.getItem(this.versionKey);
        
        if (storedVersion && storedVersion !== this.currentVersion) {
            console.log('🆕 检测到新版本！');
            console.log('存储版本:', storedVersion);
            console.log('当前版本:', this.currentVersion);
            
            this.showUpdateNotification();
        }
        
        // 更新存储的版本号
        localStorage.setItem(this.versionKey, this.currentVersion);
    }

    /**
     * 开始定期检查版本更新
     */
    startVersionCheck() {
        setInterval(() => {
            this.checkForUpdates();
        }, this.versionCheckInterval);
    }

    /**
     * 检查是否有更新（通过请求版本文件）
     */
    async checkForUpdates() {
        try {
            // 尝试多种版本检查方式
            const versionSources = [
                '/version.json',
                '/VERSION.txt',
                '/.netlify/functions/version'
            ];

            for (const source of versionSources) {
                try {
                    const response = await fetch(source + '?' + Date.now());
                    if (response.ok) {
                        let serverVersion;
                        
                        if (source.endsWith('.json')) {
                            const versionData = await response.json();
                            serverVersion = versionData.version;
                        } else {
                            const versionInfo = await response.text();
                            serverVersion = this.extractVersionFromInfo(versionInfo);
                        }
                        
                        if (serverVersion && serverVersion !== this.currentVersion) {
                            console.log('🆕 发现新版本:', serverVersion, '来源:', source);
                            this.handleVersionUpdate(serverVersion);
                            return;
                        }
                        break; // 成功检查到版本，退出循环
                    }
                } catch (err) {
                    console.log('⚠️ 版本源检查失败:', source, err.message);
                    continue; // 尝试下一个版本源
                }
            }
        } catch (error) {
            console.log('⚠️ 版本检查失败:', error.message);
        }
    }

    /**
     * 从版本信息中提取版本号
     */
    extractVersionFromInfo(versionInfo) {
        const versionMatch = versionInfo.match(/版本戳:\s*(\d+)/);
        return versionMatch ? versionMatch[1] : null;
    }

    /**
     * 处理版本更新
     */
    handleVersionUpdate(newVersion) {
        localStorage.setItem(this.versionKey, newVersion);
        this.showUpdateNotification();
    }

    /**
     * 显示更新通知
     */
    showUpdateNotification() {
        // 检查是否已经显示过通知
        const lastNotification = localStorage.getItem('last_update_notification');
        const now = Date.now();
        
        // 避免频繁通知（5分钟内只通知一次）
        if (lastNotification && (now - parseInt(lastNotification)) < 300000) {
            return;
        }

        const notification = this.createUpdateNotification();
        document.body.appendChild(notification);
        
        // 记录通知时间
        localStorage.setItem('last_update_notification', now.toString());
        
        // 3秒后自动隐藏
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 8000);
    }

    /**
     * 创建更新通知元素
     */
    createUpdateNotification() {
        const notification = document.createElement('div');
        notification.id = 'version-update-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                max-width: 350px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: slideInRight 0.5s ease-out;
            ">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 20px; margin-right: 10px;">🎉</span>
                    <span style="font-weight: bold; font-size: 16px;">发现新版本！</span>
                </div>
                <div style="margin-bottom: 15px; opacity: 0.9; font-size: 14px;">
                    代码生成器已更新，点击刷新获取最新功能
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="versionManager.forceRefresh()" style="
                        background: rgba(255,255,255,0.2);
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                    ">🔄 立即刷新</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                        background: transparent;
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    ">稍后提醒</button>
                </div>
            </div>
            <style>
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        return notification;
    }

    /**
     * 强制刷新页面
     */
    forceRefresh() {
        console.log('🔄 强制刷新页面...');
        
        // 清除可能的缓存
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        
        // 强制刷新
        window.location.reload(true);
    }

    /**
     * 添加版本信息到页面
     */
    addVersionInfo() {
        // 在页面底部添加版本信息
        const versionInfo = document.createElement('div');
        versionInfo.id = 'version-info';
        versionInfo.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            font-family: monospace;
            z-index: 1000;
            opacity: 0.7;
            cursor: pointer;
        `;
        versionInfo.textContent = `v${this.currentVersion}`;
        versionInfo.title = `点击检查更新 | 版本: ${this.currentVersion}`;
        
        // 点击版本号手动检查更新
        versionInfo.addEventListener('click', () => {
            this.checkForUpdates();
            versionInfo.textContent = '检查中...';
            setTimeout(() => {
                versionInfo.textContent = `v${this.currentVersion}`;
            }, 2000);
        });
        
        document.body.appendChild(versionInfo);
    }

    /**
     * 获取版本信息用于显示
     */
    getVersionInfo() {
        return {
            version: this.currentVersion,
            lastCheck: localStorage.getItem(this.lastVersionCheckKey),
            checkInterval: this.versionCheckInterval
        };
    }
}

// 全局实例
let versionManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    versionManager = new VersionManager();
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VersionManager;
} 