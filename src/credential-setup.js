import os from "node:os";
import path from "node:path";
import { CredentialStore } from "./main/ai/credentials/CredentialStore";
import { CredentialStoreService } from "./main/ai/credentials/CredentialStoreService";
import { runGeminiCredentialSetup } from "./main/ai/credentials/GeminiCredentialSetup";
import { MacOSKeychainCredentialStoreAdapter } from "./main/ai/credentials/MacOSKeychainCredentialStoreAdapter";

const main = async () => {
  try {
    const credentialStore = new CredentialStore(
      new MacOSKeychainCredentialStoreAdapter()
    );
    const credentialStoreService = new CredentialStoreService({
      store: credentialStore,
    });

    await runGeminiCredentialSetup({
      credentialStore,
      credentialStoreService,
      repositoryPath: process.cwd(),
      appDataPath: path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "ai-training-studio-pro"
      ),
    });
  } catch {
    process.stderr.write("Credential setup failed.\n");
    process.exitCode = 1;
  }
};

main();
