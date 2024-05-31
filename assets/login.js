(function __bootstrap() {
    const {remote, ipcRenderer} = require('electron');
    const path = require('path');
    const mod = require('module');
    const url = require('url');
    window.onload = () => {
        try {     
            window.loadSettings = JSON.parse(decodeURIComponent(window.location.hash.substr(1)));                                                       
            process.resourcePath = loadSettings.resourcePath;
                        
            if (process.env.RYVER_DEVELOPER_SERVER) {
                module.filename = global.__filename;
                module.paths = module.paths.concat(
                    mod._nodeModulePaths(global.__dirname),
                    path.resolve(loadSettings.resourcePath, 'node_modules')
                );                                
                const script = document.createElement('script');
                script.src = url.format(Object.assign(url.parse(process.env.RYVER_DEVELOPER_SERVER), {
                    pathname: `/javascripts/login.js`
                }));                
                document.body.appendChild(script);
            } else {
                require(`./javascripts/login.js`);
            }            
        }
        catch (error) {            
            const browserWindow = remote.getCurrentWindow();
            browserWindow.show();            
            browserWindow.openDevTools();
            console.error(error.stack || error);
        }
    };
})();