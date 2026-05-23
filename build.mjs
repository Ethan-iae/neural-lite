import fs from 'fs-extra';
import CleanCSS from 'clean-css';
import { minify } from 'html-minifier-terser';
import JavaScriptObfuscator from 'javascript-obfuscator';

async function build() {
    console.log('Starting build...');
    
    fs.emptyDirSync('dist');
    
    for (const htmlFile of ['index.html', 'nokia.html']) {
        if (fs.existsSync(htmlFile)) {
            const htmlContent = fs.readFileSync(htmlFile, 'utf8');
            const minifiedHtml = await minify(htmlContent, {
                collapseWhitespace: true,
                removeComments: true,
                minifyCSS: true,
                minifyJS: true
            });
            fs.writeFileSync(`dist/${htmlFile}`, minifiedHtml);
            console.log(`Minified ${htmlFile}`);
        }
    }
    
    if (fs.existsSync('style.css')) {
        const cssContent = fs.readFileSync('style.css', 'utf8');
        const minifiedCss = new CleanCSS({}).minify(cssContent).styles;
        fs.writeFileSync('dist/style.css', minifiedCss);
        console.log('Minified style.css');
    }
    
    if (fs.existsSync('app.js')) {
        const jsContent = fs.readFileSync('app.js', 'utf8');
        const obfuscationResult = JavaScriptObfuscator.obfuscate(jsContent, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.5,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.2,
            debugProtection: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayCallsTransformThreshold: 0.5,
            stringArrayEncoding: ['base64'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 1,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 2,
            stringArrayWrappersType: 'variable',
            stringArrayThreshold: 0.75,
            unicodeEscapeSequence: false
        });
        fs.writeFileSync('dist/app.js', obfuscationResult.getObfuscatedCode());
        console.log('Obfuscated app.js');
    }
    
    const copyList = ['assets', 'Vocabulary', 'alien-monster_1f47e.png'];
    for (const item of copyList) {
        if (fs.existsSync(item)) {
            fs.copySync(item, `dist/${item}`);
            console.log(`Copied ${item}`);
        }
    }
    
    console.log('Build completed successfully.');
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
