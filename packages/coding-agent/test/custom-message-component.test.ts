import { Text } from "@earendil-works/pi-tui";
import { beforeAll, describe, expect, test } from "vitest";
import type { MessageRendererRegistration } from "../src/core/extensions/types.ts";
import type { CustomMessage } from "../src/core/messages.ts";
import { CustomMessageComponent } from "../src/modes/interactive/components/custom-message.ts";
import { initTheme, theme } from "../src/modes/interactive/theme/theme.ts";

describe("CustomMessageComponent", () => {
	beforeAll(() => {
		initTheme("dark");
	});

	test("uses a custom renderer's requested background", () => {
		const message: CustomMessage = {
			role: "custom",
			customType: "notification",
			content: "ready",
			display: true,
			timestamp: Date.now(),
		};
		const registration: MessageRendererRegistration = {
			renderer: () => new Text("ready", 0, 0),
			background: "toolSuccessBg",
		};
		const rendered = new CustomMessageComponent(message, registration).render(40).join("\n");
		const toolBackgroundPrefix = theme.bg("toolSuccessBg", "marker").split("marker")[0];
		const customBackgroundPrefix = theme.bg("customMessageBg", "marker").split("marker")[0];

		expect(rendered).toContain(toolBackgroundPrefix);
		expect(rendered).not.toContain(customBackgroundPrefix);
	});
});
