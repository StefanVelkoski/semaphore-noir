<p align="center">
    <h1 align="center">
        Semaphore proof
    </h1>
    <p align="center">A library to generate and verify Semaphore proofs using <a href="https://noir-lang.org/">Noir</a>.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-noir/proof">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-noir/proof?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-noir/proof">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-noir/proof.svg?style=flat-square" />
    </a>
    <a href="https://js.semaphore.appliedzkp.org/proof">
        <img alt="Documentation typedoc" src="https://img.shields.io/badge/docs-typedoc-744C7C?style=flat-square">
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint" />
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier" />
    </a>
</p>

## 🛠 Install

### npm or yarn

Install the `@semaphore-noir/proof` package and its peer dependencies with npm:

```bash
npm i @semaphore-protocol/identity @semaphore-protocol/group @semaphore-noir/proof
```

or yarn:

```bash
yarn add @semaphore-protocol/identity @semaphore-protocol/group @semaphore-noir/proof
```

## 📜 Usage

\# **generateProof**(
identity: _Identity_,
group: _Group_ | _MerkleProof_,
externalNullifier: _BytesLike | Hexable | number | bigint_,
signal: _BytesLike | Hexable | number | bigint_
): Promise\<_SemaphoreFullProof_>

```typescript
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-noir/proof"
import { utils } from "ethers"

const externalNullifier = utils.formatBytes32String("Topic")
const signal = utils.formatBytes32String("Hello world")

const group = new Group(1, 16) // group Id and treeDepth
const identity = new Identity("your-message") // create and reproduce the identity with a String message

group.addMember(identity.getCommitment())

const fullProof = await generateProof(identity, group, externalNullifier, signal)
```

\# **verifyProof**(fullProof: _FullProof_, treeDepth: _number_): Promise\<_boolean_>

```typescript
import { verifyProof } from "@semaphore-noir/proof"

await verifyProof(fullProof, 20) // fullProof and treeDepth
```

\# **calculateNullifierHash**(
identityNullifier: _bigint | number | string_,
externalNullifier: \__BytesLike | Hexable | number | bigint_
): bigint

```typescript
import { Identity } from "@semaphore-protocol/identity"
import { calculateNullifierHash } from "@semaphore-noir/proof"

const identity = new Identity()
const externalNullifier = utils.formatBytes32String("Topic")

const nullifierHash = calculateNullifierHash(identity.nullifier, externalNullifier)
```
