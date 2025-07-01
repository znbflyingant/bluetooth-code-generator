/**
 * 资源版本管理工具
 * 动态管理和加载带版本号的静态资源
 */

class ResourceVersioning {
    constructor() {
        this.resourceCache = new Map();
        this.loadedResources = new Set();
        this.versionPrefix = this.getVersionPrefix();
        
        console.log('📦 资源版本管理器初始化，版本前缀:', this.versionPrefix);
    }

    /**
     * 获取版本前缀
     */
    getVersionPrefix() {
        const metaVersion = document.querySelector('meta[name="app-version"]');
        return metaVersion ? metaVersion.content : Date.now().toString();
    }

    /**
     * 动态加载带版本号的CSS文件
     */
    loadVersionedCSS(originalPath, priority = 0) {
        return new Promise((resolve, reject) => {
            const versionedPath = this.addVersionToPath(originalPath);
            
            if (this.loadedResources.has(versionedPath)) {
                resolve(versionedPath);
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = versionedPath;
            link.dataset.priority = priority;
            
            link.onload = () => {
                this.loadedResources.add(versionedPath);
                console.log('✅ CSS加载完成:', versionedPath);
                resolve(versionedPath);
            };
            
            link.onerror = () => {
                console.error('❌ CSS加载失败:', versionedPath);
                reject(new Error(`Failed to load CSS: ${versionedPath}`));
            };

            // 根据优先级插入到适当位置
            this.insertStylesheet(link, priority);
        });
    }

    /**
     * 动态加载带版本号的JS文件
     */
    loadVersionedJS(originalPath, isModule = false) {
        return new Promise((resolve, reject) => {
            const versionedPath = this.addVersionToPath(originalPath);
            
            if (this.loadedResources.has(versionedPath)) {
                resolve(versionedPath);
                return;
            }

            const script = document.createElement('script');
            script.src = versionedPath;
            if (isModule) {
                script.type = 'module';
            }
            
            script.onload = () => {
                this.loadedResources.add(versionedPath);
                console.log('✅ JS加载完成:', versionedPath);
                resolve(versionedPath);
            };
            
            script.onerror = () => {
                console.error('❌ JS加载失败:', versionedPath);
                reject(new Error(`Failed to load JS: ${versionedPath}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * 为资源路径添加版本号
     */
    addVersionToPath(path) {
        if (path.includes('?v=')) {
            return path; // 已经有版本号
        }

        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}v=${this.versionPrefix}`;
    }

    /**
     * 插入样式表到适当位置
     */
    insertStylesheet(link, priority) {
        const head = document.head;
        const existingLinks = Array.from(head.querySelectorAll('link[rel="stylesheet"]'));
        
        // 根据优先级决定插入位置
        let insertBefore = null;
        for (const existingLink of existingLinks) {
            const existingPriority = parseInt(existingLink.dataset.priority || '0');
            if (priority > existingPriority) {
                insertBefore = existingLink;
                break;
            }
        }

        if (insertBefore) {
            head.insertBefore(link, insertBefore);
        } else {
            head.appendChild(link);
        }
    }

    /**
     * 预加载资源
     */
    preloadResource(path, type = 'script') {
        const versionedPath = this.addVersionToPath(path);
        
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = versionedPath;
        link.as = type;
        
        document.head.appendChild(link);
        console.log('🔄 预加载资源:', versionedPath);
    }

    /**
     * 批量加载资源
     */
    async loadResourcesBatch(resources) {
        const promises = resources.map(resource => {
            const { path, type, priority, isModule } = resource;
            
            switch (type) {
                case 'css':
                    return this.loadVersionedCSS(path, priority);
                case 'js':
                    return this.loadVersionedJS(path, isModule);
                default:
                    return Promise.resolve();
            }
        });

        try {
            const results = await Promise.all(promises);
            console.log('✅ 批量资源加载完成:', results.length);
            return results;
        } catch (error) {
            console.error('❌ 批量资源加载失败:', error);
            throw error;
        }
    }

    /**
     * 检查资源是否需要更新
     */
    async checkResourceUpdate(path) {
        const versionedPath = this.addVersionToPath(path);
        
        try {
            const response = await fetch(versionedPath, { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            const etag = response.headers.get('etag');
            const lastModified = response.headers.get('last-modified');
            
            const cached = this.resourceCache.get(path);
            if (cached && (cached.etag !== etag || cached.lastModified !== lastModified)) {
                console.log('🆕 检测到资源更新:', path);
                return true;
            }
            
            // 更新缓存
            this.resourceCache.set(path, { etag, lastModified });
            return false;
        } catch (error) {
            console.warn('⚠️ 资源更新检查失败:', path, error);
            return false;
        }
    }

    /**
     * 强制重新加载所有资源
     */
    forceReloadResources() {
        console.log('🔄 强制重新加载所有资源...');
        
        // 清除资源缓存
        this.resourceCache.clear();
        this.loadedResources.clear();
        
        // 更新版本前缀
        this.versionPrefix = Date.now().toString();
        
        // 重新加载页面
        window.location.reload(true);
    }

    /**
     * 获取资源加载统计
     */
    getLoadStats() {
        return {
            loadedCount: this.loadedResources.size,
            cachedCount: this.resourceCache.size,
            versionPrefix: this.versionPrefix,
            loadedResources: Array.from(this.loadedResources)
        };
    }
}

// 创建全局实例
window.resourceVersioning = new ResourceVersioning();

// 监听页面加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 资源版本管理器就绪');
    
    // 可以在这里预加载重要资源
    // window.resourceVersioning.preloadResource('js/main.js', 'script');
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourceVersioning;
} 