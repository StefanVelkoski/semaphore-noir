import fs from "fs"
import type { Config } from "@jest/types"

const projects: any = fs
    .readdirSync("./packages", { withFileTypes: true })
    .filter((directory) => directory.isDirectory())
    .map(({ name }) => ({
        rootDir: `packages/${name}`,
        displayName: name,
        setupFiles: ["dotenv/config"],
        moduleNameMapper: {
            "@semaphore-protocol/(.*)": "<rootDir>/../$1/src/index.ts" // Interdependency packages.
        }
    }))

export default async (): Promise<Config.InitialOptions> => ({
    projects,
    testTimeout: 80_000,
    // transform: {},
    transformIgnorePatterns: [
      "node_modules/(?!@noir-lang/noir-source-resolver)",
      "packages/proof/node_modules/(?!@noir-lang/noir-source-resolver)",
    ],
    verbose: true,
    coverageDirectory: "./coverage/libraries",
    collectCoverageFrom: ["<rootDir>/src/**/*.ts", "!<rootDir>/src/**/index.ts", "!<rootDir>/src/**/*.d.ts"],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 95,
            lines: 95,
            statements: 95
        }
    }
})
