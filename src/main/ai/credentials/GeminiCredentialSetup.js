import fs from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import {
  CREDENTIAL_IPC_CONTRACT_VERSION,
  CredentialIPCOperation,
} from "./CredentialIPCContract";
import { CredentialIPCValidator } from "./CredentialIPCValidator";

export const GEMINI_CREDENTIAL_PROVIDER_ID = "gemini";
export const GEMINI_DEFAULT_CREDENTIAL_ID = "gemini-default";
export const GEMINI_DEFAULT_CREDENTIAL_DISPLAY_NAME = "Gemini default";

const repositoryExclusions = Object.freeze(
  new Set([".git", ".vite", "node_modules", "out"])
);

const requireStore = (store) => {
  const methods = ["exists", "getSecret", "listMetadata"];

  if (!methods.every((method) => typeof store?.[method] === "function")) {
    throw new TypeError("Gemini credential setup requires a trusted store.");
  }

  return store;
};

const requireService = (service) => {
  if (typeof service?.createCredential !== "function") {
    throw new TypeError("Gemini credential setup requires a store service.");
  }

  return service;
};

const promptPublicMetadata = async ({ input, output }) => {
  const prompt = createInterface({ input, output, terminal: true });

  try {
    const credentialId =
      (
        await prompt.question(
          `Credential ID [${GEMINI_DEFAULT_CREDENTIAL_ID}]: `
        )
      ).trim() || GEMINI_DEFAULT_CREDENTIAL_ID;
    const displayName =
      (
        await prompt.question(
          `Display name [${GEMINI_DEFAULT_CREDENTIAL_DISPLAY_NAME}]: `
        )
      ).trim() || GEMINI_DEFAULT_CREDENTIAL_DISPLAY_NAME;

    return Object.freeze({ credentialId, displayName });
  } finally {
    prompt.close();
  }
};

const promptMaskedSecret = ({ input, output }) => {
  if (
    input.isTTY !== true ||
    typeof input.setRawMode !== "function" ||
    output.isTTY !== true
  ) {
    throw new Error("Credential setup requires an interactive terminal.");
  }

  return new Promise((resolve, reject) => {
    let secret = "";
    const wasRaw = input.isRaw === true;

    const cleanup = () => {
      input.removeListener("data", onData);
      input.setRawMode(wasRaw);
      input.pause();
    };
    const fail = () => {
      cleanup();
      output.write("\n");
      reject(new Error("Credential setup was cancelled."));
    };
    const complete = () => {
      cleanup();
      output.write("\n");

      if (!secret) {
        reject(new Error("A Gemini API key is required."));
        return;
      }

      resolve(secret);
    };
    const onData = (chunk) => {
      for (const character of String(chunk)) {
        if (character === "\u0003") {
          fail();
          return;
        }

        if (character === "\r" || character === "\n") {
          complete();
          return;
        }

        if (character === "\u007f" || character === "\b") {
          if (secret.length > 0) {
            secret = secret.slice(0, -1);
            output.write("\b \b");
          }

          continue;
        }

        if (character >= " ") {
          secret += character;
          output.write("*");
        }
      }
    };

    output.write("Gemini API key: ");
    input.setEncoding("utf8");
    input.setRawMode(true);
    input.resume();
    input.on("data", onData);
  });
};

const validateSetupPayload = ({ credentialId, displayName, secret }) => {
  const validator = new CredentialIPCValidator({
    supportedProviderIds: [GEMINI_CREDENTIAL_PROVIDER_ID],
  });
  const validation = validator.validate({
    contractVersion: CREDENTIAL_IPC_CONTRACT_VERSION,
    operation: CredentialIPCOperation.CREATE,
    payload: {
      providerId: GEMINI_CREDENTIAL_PROVIDER_ID,
      credentialId,
      displayName,
      secret,
    },
  });

  if (!validation.valid) {
    throw new Error("Credential setup input is invalid.");
  }

  return validation.message.payload;
};

const fileContainsSecret = async (filePath, secretBuffer) => {
  const handle = await fs.open(filePath, "r");
  const overlapSize = Math.max(secretBuffer.length - 1, 0);
  let overlap = Buffer.alloc(0);
  const chunk = Buffer.alloc(64 * 1024);

  try {
    while (true) {
      const { bytesRead } = await handle.read(chunk, 0, chunk.length, null);

      if (bytesRead === 0) {
        return false;
      }

      const searchable = Buffer.concat([overlap, chunk.subarray(0, bytesRead)]);

      if (searchable.includes(secretBuffer)) {
        return true;
      }

      overlap = searchable.subarray(
        Math.max(searchable.length - overlapSize, 0)
      );
    }
  } finally {
    await handle.close();
  }
};

const directoryContainsSecret = async (
  directory,
  secretBuffer,
  exclusions = new Set()
) => {
  let entries;

  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }

  for (const entry of entries) {
    if (exclusions.has(entry.name) || entry.isSymbolicLink()) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (await directoryContainsSecret(entryPath, secretBuffer, exclusions)) {
        return true;
      }
    } else if (
      entry.isFile() &&
      (await fileContainsSecret(entryPath, secretBuffer))
    ) {
      return true;
    }
  }

  return false;
};

const verifyNoPlaintextCopy = async ({
  secret,
  repositoryPath,
  appDataPath,
}) => {
  const secretBuffer = Buffer.from(secret, "utf8");
  const repositoryContainsSecret = await directoryContainsSecret(
    repositoryPath,
    secretBuffer,
    repositoryExclusions
  );
  const appDataContainsSecret = await directoryContainsSecret(
    appDataPath,
    secretBuffer
  );

  if (repositoryContainsSecret || appDataContainsSecret) {
    throw new Error("Credential plaintext verification failed.");
  }
};

const printSafeResult = ({ output, metadata, trustedRetrieval }) => {
  output.write(`credential ID: ${metadata.credentialId}\n`);
  output.write(`provider ID: ${metadata.providerId}\n`);
  output.write(`display name: ${metadata.displayName}\n`);
  output.write(`status: ${metadata.status}\n`);
  output.write(`trusted retrieval: ${trustedRetrieval ? "OK" : "FAILED"}\n`);
};

export const runGeminiCredentialSetup = async ({
  credentialStore,
  credentialStoreService,
  repositoryPath,
  appDataPath,
  input = process.stdin,
  output = process.stdout,
}) => {
  const store = requireStore(credentialStore);
  const service = requireService(credentialStoreService);
  const publicMetadata = await promptPublicMetadata({ input, output });
  const secret = await promptMaskedSecret({ input, output });
  const payload = validateSetupPayload({ ...publicMetadata, secret });
  const metadata = await service.createCredential(payload);
  const exists = await store.exists(
    GEMINI_CREDENTIAL_PROVIDER_ID,
    metadata.credentialId
  );
  const retrievedSecret = await store.getSecret(
    GEMINI_CREDENTIAL_PROVIDER_ID,
    metadata.credentialId
  );
  const trustedRetrieval = exists && retrievedSecret === secret;
  const listedMetadata = await store.listMetadata(
    GEMINI_CREDENTIAL_PROVIDER_ID
  );
  const publicRecord = listedMetadata
    .find((item) => item.credentialId === metadata.credentialId)
    ?.toPublicRecord();

  if (
    !trustedRetrieval ||
    !publicRecord ||
    JSON.stringify(publicRecord).includes(secret)
  ) {
    throw new Error("Credential verification failed.");
  }

  await verifyNoPlaintextCopy({ secret, repositoryPath, appDataPath });
  printSafeResult({ output, metadata: publicRecord, trustedRetrieval });

  return publicRecord;
};
