export default{
    build: {
        outDir: './dist/',
        target: ['es2015'],
        lib: {
            entry: 'lib/quantum-circuit.js',
            formats: ['es'],
            fileName: (format) => ({
                es: `quantum-circuit.js`,
            })[format]
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true
            }
        },
    }
};

