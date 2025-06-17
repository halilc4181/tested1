// Environment configuration for flexible deployment
export class EnvironmentConfig {
  private static _basePath: string | null = null;
  private static _apiBasePath: string | null = null;

  /**
   * Automatically detect the base path from current URL
   */
  static getBasePath(): string {
    if (this._basePath !== null) {
      return this._basePath;
    }

    // Get current path from window location
    const currentPath = window.location.pathname;
    
    // Check if we're in a subdirectory
    const pathSegments = currentPath.split('/').filter(segment => segment);
    
    // If we have segments and the first one looks like a project folder
    if (pathSegments.length > 0) {
      const firstSegment = pathSegments[0];
      
      // Common project folder patterns
      const projectPatterns = [
        'test', 'test5', 'demo', 'staging', 'dev',
        'diyetisyen', 'diyetisyen-sistemi', 'lisans-sistemi'
      ];
      
      // Check if first segment matches project patterns or contains common keywords
      const isProjectFolder = projectPatterns.some(pattern => 
        firstSegment.includes(pattern)
      ) || firstSegment.match(/^(test|demo|dev|staging)\d*$/);
      
      if (isProjectFolder) {
        this._basePath = `/${firstSegment}`;
        return this._basePath;
      }
    }
    
    // Default to root if no subdirectory detected
    this._basePath = '';
    return this._basePath;
  }

  /**
   * Get API base path
   */
  static getApiBasePath(): string {
    if (this._apiBasePath !== null) {
      return this._apiBasePath;
    }

    const basePath = this.getBasePath();
    this._apiBasePath = `${basePath}/api`;
    return this._apiBasePath;
  }

  /**
   * Manual override for base path (useful for specific deployments)
   */
  static setBasePath(path: string): void {
    this._basePath = path;
    this._apiBasePath = `${path}/api`;
  }

  /**
   * Reset to auto-detection
   */
  static resetToAutoDetect(): void {
    this._basePath = null;
    this._apiBasePath = null;
  }

  /**
   * Get deployment info for debugging
   */
  static getDeploymentInfo() {
    return {
      currentUrl: window.location.href,
      pathname: window.location.pathname,
      detectedBasePath: this.getBasePath(),
      apiBasePath: this.getApiBasePath(),
      isSubdirectory: this.getBasePath() !== '',
    };
  }
}

// Export for easy access
export const ENV = EnvironmentConfig;