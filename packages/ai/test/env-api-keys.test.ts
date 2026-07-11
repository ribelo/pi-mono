import { afterEach, describe, expect, it } from "vitest";
import { findEnvKeys, getEnvApiKey, hasEnvAuth } from "../src/env-api-keys.ts";
import type { ProviderEnv } from "../src/types.ts";

const originalCopilotGitHubToken = process.env.COPILOT_GITHUB_TOKEN;
const originalGhToken = process.env.GH_TOKEN;
const originalGitHubToken = process.env.GITHUB_TOKEN;
const originalZaiCodingCnApiKey = process.env.ZAI_CODING_CN_API_KEY;
const ambientBedrockEnvs: ProviderEnv[] = [
	{ AWS_PROFILE: "bedrock-profile" },
	{ AWS_ACCESS_KEY_ID: "access-key", AWS_SECRET_ACCESS_KEY: "secret-key" },
	{ AWS_CONTAINER_CREDENTIALS_RELATIVE_URI: "/credentials" },
	{ AWS_CONTAINER_CREDENTIALS_FULL_URI: "http://localhost/credentials" },
	{ AWS_WEB_IDENTITY_TOKEN_FILE: "/var/run/secrets/token" },
];

afterEach(() => {
	if (originalCopilotGitHubToken === undefined) {
		delete process.env.COPILOT_GITHUB_TOKEN;
	} else {
		process.env.COPILOT_GITHUB_TOKEN = originalCopilotGitHubToken;
	}

	if (originalGhToken === undefined) {
		delete process.env.GH_TOKEN;
	} else {
		process.env.GH_TOKEN = originalGhToken;
	}

	if (originalGitHubToken === undefined) {
		delete process.env.GITHUB_TOKEN;
	} else {
		process.env.GITHUB_TOKEN = originalGitHubToken;
	}

	if (originalZaiCodingCnApiKey === undefined) {
		delete process.env.ZAI_CODING_CN_API_KEY;
	} else {
		process.env.ZAI_CODING_CN_API_KEY = originalZaiCodingCnApiKey;
	}
});

describe("environment API keys", () => {
	it("does not treat generic GitHub tokens as GitHub Copilot credentials", () => {
		delete process.env.COPILOT_GITHUB_TOKEN;
		process.env.GH_TOKEN = "gh-token";
		process.env.GITHUB_TOKEN = "github-token";

		expect(findEnvKeys("github-copilot")).toBeUndefined();
		expect(getEnvApiKey("github-copilot")).toBeUndefined();
	});

	it("resolves GitHub Copilot credentials from COPILOT_GITHUB_TOKEN", () => {
		process.env.COPILOT_GITHUB_TOKEN = "copilot-token";
		process.env.GH_TOKEN = "gh-token";
		process.env.GITHUB_TOKEN = "github-token";

		expect(findEnvKeys("github-copilot")).toEqual(["COPILOT_GITHUB_TOKEN"]);
		expect(getEnvApiKey("github-copilot")).toBe("copilot-token");
	});

	it("resolves ZAI China Coding Plan credentials from ZAI_CODING_CN_API_KEY", () => {
		process.env.ZAI_CODING_CN_API_KEY = "zai-coding-cn-token";

		expect(findEnvKeys("zai-coding-cn")).toEqual(["ZAI_CODING_CN_API_KEY"]);
		expect(getEnvApiKey("zai-coding-cn")).toBe("zai-coding-cn-token");
	});

	it("resolves a Bedrock bearer token as an API key", () => {
		const env = { AWS_BEARER_TOKEN_BEDROCK: "bedrock-token", AWS_PROFILE: "bedrock-profile" };

		expect(findEnvKeys("amazon-bedrock", env)).toEqual(["AWS_BEARER_TOKEN_BEDROCK"]);
		expect(getEnvApiKey("amazon-bedrock", env)).toBe("bedrock-token");
	});

	it.each(ambientBedrockEnvs)("does not return ambient Bedrock credentials as an API key", (env) => {
		expect(findEnvKeys("amazon-bedrock", env)).toBeUndefined();
		expect(getEnvApiKey("amazon-bedrock", env)).toBeUndefined();
		expect(hasEnvAuth("amazon-bedrock", env)).toBe(true);
	});
});
