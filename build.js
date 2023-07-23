const fs = require('fs-extra');

async function build() {
    try {
        await fs.copy('index.html', 'public/index.html');
        await fs.copy('main.js', 'public/main.js');
        await fs.copy('index.js', 'public/index.js');

        console.log('Build successful!');
    } catch (err) {
        console.error(err);
    }
}

build();
