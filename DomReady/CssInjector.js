/**
 * The CSS injector, do not modify this
 */

function readFile(path, encoding = 'utf-8') {
    return new Promise((resolve, reject) => {
        window._fs.readFile(path, encoding, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

class CssInjector {
    constructor() {
        let diNode = window.DI.localStorage.getItem('DI-DiscordInjections');
        if (diNode === null) {
            let path = window.DI.localStorage.getItem('customCss') || 'style.css';
            window.DI.localStorage.setItem('DI-DiscordInjections', JSON.stringify({ cssPath: path }));
        } else if (!this.path) {
            let diNode = JSON.parse(window.DI.localStorage.getItem('DI-DiscordInjections'));
            diNode.cssPath = 'style.css';
            window.DI.localStorage.setItem('DI-DiscordInjections', JSON.stringify(diNode));
        }

        this.watch();
        this.watcher = null;
        this.styleTag = null;

        try {
            window._fs.statSync(this.path);
        } catch (err) {
            try {
                window._fs.writeFileSync(this.path, '');
            } catch (err) {
                console.log('Could not generate an empty CSS file in the provided path.');
            }
        }
    }

    destroy() {
        if (this.watcher != null) {
            this.watcher.close();
            this.watcher = null;
        }
        if (this.styleTag != null) {
            this.styleTag.innerHTMl = "";
        }
    }

    watch() {
        let location = this.path;
        if (!window._path.isAbsolute(location))
            location = window._path.join(__dirname, '..', 'CSS', location);

        readFile(location).then(css => {
            this.rawCss = css;

            if (this.styleTag == null) {
                this.styleTag = document.createElement('style');
                document.head.appendChild(this.styleTag);
            }
            this.styleTag.innerHTML = this.rawCss;

            if (this.watcher == null) {
                this.watcher = window._fs.watch(location, { encoding: 'utf-8' },
                    eventType => {
                        if (eventType == 'change') {
                            readFile(location).then(css => {
                                this.rawCss = css;
                                this.styleTag.innerHTML = this.rawCss;
                            });
                        }
                    });
            }
        });
    }

    set(location) {
        this.destroy();
        this.setPath(location);
        this.watch();
    }

    refresh() {
        this.destroy();
        this.watch();
    }

    setPath(location) {
        if (!window._path.isAbsolute(location))
            location = window._path.join(__dirname, '..', 'CSS', location);
        try {
            window._fs.statSync(location);
            if (location.endsWith('.css')) {
                let diNode = JSON.parse(window.DI.localStorage.getItem('DI-DiscordInjections'));
                diNode.cssPath = location;
                window.DI.localStorage.setItem('DI-DiscordInjections', JSON.stringify(diNode));
            }
            else throw new Error('Invalid CSS File');
        } catch (err) {
            throw new Error('CSS File did not exist');
        }
    }

    get path() {
        return JSON.parse(window.DI.localStorage.getItem('DI-DiscordInjections')).cssPath;
    }
}

module.exports = CssInjector;