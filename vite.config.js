export default {
	build: {
		outDir: "./dist/",
		target: ["esnext"],
		lib: {
			entry: "lib/quantum-circuit.js",
			formats: ["es", "cjs"],
			fileName: (format) =>
				({
					es: "quantum-circuit.js",
					cjs: "quantum-circuit.cjs",
				})[format],
		},
		rollupOptions: {
			output: {
				inlineDynamicImports: true,
			},
		},
	},
};
