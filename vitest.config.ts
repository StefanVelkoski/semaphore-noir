import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        globals: true,
        exclude: ["./packages/circuits/test/onchain.test.ts", "node_modules"]
    }
})
