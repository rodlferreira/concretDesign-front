const { chromium } = require("playwright");
const { AxeBuilder } = require("@axe-core/playwright");
const { spawn } = require("node:child_process");
const { mkdtempSync, rmSync, mkdirSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { randomBytes } = require("node:crypto");
const backend =
  process.env.BACKEND_DIR ||
  resolve(__dirname, "../../../NodeJS/concretDesign-back");
let browser, context, page, api, web, directory;
let serverLogs = "";
let baseUrl;
const { createServer } = require("node:net");
function availablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}
async function ready(url, process) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (process.exitCode !== null) throw new Error(serverLogs);
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Not ready: ${url}\n${serverLogs}`);
}
function start(cmd, args, options) {
  const child = spawn(cmd, args, {
    ...options,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (data) => (serverLogs += data));
  child.stderr.on("data", (data) => (serverLogs += data));
  return child;
}
beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), "concret-e2e-"));
  const apiPort = await availablePort();
  const webPort = await availablePort();
  baseUrl = `http://127.0.0.1:${webPort}`;
  const apiUrl = `http://127.0.0.1:${apiPort}`;
  api = start(process.execPath, ["src/server.js"], {
    cwd: backend,
    env: {
      ...process.env,
      PORT: String(apiPort),
      NODE_ENV: "test",
      DATABASE_PATH: join(directory, "quotes.sqlite"),
      DATA_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
      SMTP_HOST: "",
      ALLOWED_ORIGINS: baseUrl,
    },
  });
  web = start(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      "--port",
      String(webPort),
    ],
    {
      cwd: resolve(__dirname, ".."),
      env: { ...process.env, API_PROXY_TARGET: apiUrl },
    },
  );
  await Promise.all([ready(`${apiUrl}/api/health`, api), ready(baseUrl, web)]);
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {}),
  });
}, 30000);
beforeEach(async () => {
  context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page = await context.newPage();
  await page.goto(baseUrl);
  await page.locator("h1").waitFor();
});
afterEach(async () => {
  await context?.close();
});
afterAll(async () => {
  await browser?.close();
  await Promise.all(
    [api, web].filter(Boolean).map(
      (child) =>
        new Promise((resolve) => {
          if (child.exitCode !== null) return resolve();
          child.once("exit", resolve);
          child.kill("SIGTERM");
        }),
    ),
  );
  if (directory) rmSync(directory, { recursive: true, force: true });
});
test("homepage, local images and navigation are complete", async () => {
  expect(await page.title()).toContain("ConcretDesign");
  expect(await page.locator(".featured-row").count()).toBe(4);
  expect(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.every((img) => !img.complete || img.naturalWidth > 0),
      ),
  ).toBe(true);
  await page
    .getByRole("link", { name: "Ver projeto", exact: true })
    .first()
    .click();
  expect(page.url()).toContain("/projects/hotel");
  expect(await page.locator("h1").textContent()).toContain("Receção de hotel");
  await page.getByRole("slider").fill("70");
  expect(await page.getByRole("slider").inputValue()).toBe("70");
});
test("themes and contrast persist after reload", async () => {
  expect(await page.getByRole("switch").count()).toBe(1);
  expect(await page.getByRole("switch").getAttribute("aria-checked")).toBe(
    "false",
  );

  await page
    .getByRole("switch", { name: "Alternar tema claro e escuro" })
    .click();
  expect(await page.locator("html").getAttribute("data-theme")).toBe("light");
  expect(await page.getByRole("switch").getAttribute("aria-checked")).toBe(
    "true",
  );
  expect(
    await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(255, 255, 255)");
  expect(
    await page
      .locator(".services")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(255, 255, 255)");

  await page
    .getByRole("button", { name: "Alto contraste", exact: true })
    .click();
  expect(await page.locator("html").getAttribute("data-contrast")).toBe("true");
  await page.reload();
  expect(await page.locator("html").getAttribute("data-theme")).toBe("light");
  expect(await page.getByRole("switch").getAttribute("aria-checked")).toBe(
    "true",
  );
  expect(
    await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(255, 255, 255)");
  expect(
    await page
      .locator(".services")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
  ).toBe("rgb(255, 255, 255)");

  expect(await page.locator("html").getAttribute("data-contrast")).toBe("true");
  await page.getByRole("switch").focus();
  await page.keyboard.press("Space");
  expect(await page.getByRole("switch").getAttribute("aria-checked")).toBe(
    "false",
  );
  expect(await page.locator("html").getAttribute("data-theme")).toBe("dark");
});
test("language selector translates page, metadata and form and persists", async () => {
  await page
    .getByRole("button", { name: "Escolher idioma", exact: true })
    .click();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.waitForFunction(() => document.documentElement.lang === "en");
  expect(await page.locator("h1").textContent()).not.toContain("Revestimentos");
  expect(
    await page.locator("input[name=name]").locator("..").textContent(),
  ).not.toContain("Nome");
  await page.reload();
  await page.waitForFunction(() => document.documentElement.lang === "en");
  expect(await page.title()).not.toBe(
    "ConcretDesign | Revestimentos decorativos",
  );
});
test("language search and Escape return focus to the trigger", async () => {
  const toggle = page.getByRole("button", {
    name: "Escolher idioma",
    exact: true,
  });
  await toggle.click();
  await page.getByRole("textbox", { name: "Pesquisar idioma" }).fill("Deutsch");
  expect(await page.locator(".language-grid button").count()).toBe(1);
  await page.keyboard.press("Escape");
  expect(await toggle.getAttribute("aria-expanded")).toBe("false");
  expect(await toggle.evaluate((el) => el === document.activeElement)).toBe(
    true,
  );
});
test("portfolio filter and project route work", async () => {
  await page.goto(`${baseUrl}/portfolio`);
  expect(await page.locator(".project-card").count()).toBe(7);
  await page.getByRole("button", { name: "Microcimento", exact: true }).click();
  expect(await page.locator(".project-card").count()).toBe(2);
  await page.locator(".project-card").first().click();
  expect(page.url()).toContain("/projects/hotel");
});
test("submits a quote through the actual API and persists an encrypted record", async () => {
  await page.locator("[name=name]").fill("Cliente E2E");
  await page.locator("[name=company]").fill("Empresa E2E");
  await page.locator("[name=email]").fill("e2e@example.com");
  await page.locator("[name=location]").fill("Lisboa");
  await page.locator("[name=service]").selectOption("micro");
  await page.locator("[name=consent]").check();
  const response = page.waitForResponse(
    (r) => r.url().endsWith("/api/quotes") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Pedir orçamento", exact: true })
    .click();
  expect((await response).status()).toBe(201);
  await page.locator(".form-status.sent").waitFor();
  expect(await page.locator(".form-status").textContent()).toContain(
    "Pedido registado com sucesso",
  );
  const { DatabaseSync } = require("node:sqlite");
  const db = new DatabaseSync(join(directory, "quotes.sqlite"), {
    readOnly: true,
  });
  try {
    const row = db.prepare("SELECT payload FROM quotes").get();
    expect(row.payload).toBeTruthy();
    expect(row.payload).not.toContain("e2e@example.com");
  } finally {
    db.close();
  }
});
test("network failure keeps input and permits a retry", async () => {
  await page.route("**/api/quotes", (r) => r.abort());
  await page.locator("[name=name]").fill("Cliente E2E");
  await page.locator("[name=company]").fill("Empresa E2E");
  await page.locator("[name=email]").fill("e2e@example.com");
  await page.locator("[name=location]").fill("Lisboa");
  await page.locator("[name=service]").selectOption("micro");
  await page.locator("[name=consent]").check();
  await page
    .getByRole("button", { name: "Pedir orçamento", exact: true })
    .click();
  await page.locator(".form-status.error").waitFor();
  expect(await page.locator("[name=name]").inputValue()).toBe("Cliente E2E");
  expect(
    await page
      .getByRole("button", { name: "Pedir orçamento", exact: true })
      .isEnabled(),
  ).toBe(true);
});
test("mobile menu, content and form fit a 375px viewport", async () => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  expect(await page.locator(".navigation").isVisible()).toBe(true);
  await page
    .locator(".navigation")
    .getByRole("link", { name: "Contactos" })
    .click();
  expect(await page.locator(".navigation").isVisible()).toBe(false);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  mkdirSync("test-results", { recursive: true });
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
test.each(["dark", "light"])(
  "no WCAG 2.2 AA accessibility violations in %s theme",
  async (theme) => {
    if (theme === "light")
      await page
        .getByRole("switch", { name: "Alternar tema claro e escuro" })
        .click();
    await page.locator("#contactos").scrollIntoViewIfNeeded();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    mkdirSync("test-results", { recursive: true });
    await page.evaluate(() => {
      document.activeElement?.blur();
      window.scrollTo(0, 0);
    });
    await page.screenshot({
      path: `test-results/${theme}.png`,
      fullPage: true,
    });
    await page.screenshot({ path: `test-results/${theme}-viewport.png` });
  },
);

test("all published languages load complete pages without horizontal overflow", async () => {
  const languages = require("../src/i18n/languages.json");
  for (const language of languages) {
    await page.locator(".language-toggle").click();
    await page.locator(".language-search input").fill(language.name);
    await page
      .getByRole("button", { name: language.name, exact: true })
      .click();
    await page.waitForFunction(
      (code) => document.documentElement.lang === code,
      language.code,
    );
    expect(await page.locator("h1").textContent()).toBeTruthy();
    for (const width of [375, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
}, 60000);

test("text reveals on scroll, buttons glow gold and reduced motion stays accessible", async () => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  const title = page.locator("#sobre h2");
  await page.waitForFunction(() =>
    document.querySelector("#sobre h2")?.classList.contains("reveal-ready"),
  );
  expect(await title.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
  await title.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector("#sobre h2")).opacity === "1",
  );
  const button = page.locator(".header-quote");
  const initial = await button.evaluate(
    (el) => getComputedStyle(el).backgroundImage,
  );
  await button.hover();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".header-quote")).boxShadow !==
      "none",
  );
  expect(
    await button.evaluate((el) => getComputedStyle(el).backgroundImage),
  ).not.toBe(initial);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await button.evaluate((el) => getComputedStyle(el).transform)).toBe(
    "none",
  );
  expect(await title.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  await page.reload();
  expect(await page.locator(".reveal-ready").count()).toBe(0);
});

test.each([
  ["dark", false],
  ["light", false],
  ["dark", true],
  ["light", true],
])(
  "gold hover stays visible in %s theme with high contrast %s",
  async (theme, contrast) => {
    if (theme === "light") await page.getByRole("switch").click();
    if (contrast)
      await page
        .getByRole("button", { name: "Alto contraste", exact: true })
        .click();
    const appearance = (el) => {
      const style = getComputedStyle(el);
      return { image: style.backgroundImage, color: style.backgroundColor };
    };
    for (const selector of [
      ".header-quote",
      ".hero-buttons .button:not(.outline)",
      ".hero-buttons .outline",
      ".quote-form > .button",
    ]) {
      await page.mouse.move(0, 0);
      const button = page.locator(selector);
      const before = await button.evaluate(appearance);
      if (selector !== ".hero-buttons .outline") {
        expect(before.image).toBe(
          "linear-gradient(115deg, rgb(193, 134, 89), rgb(171, 115, 73))",
        );
        expect(await button.evaluate((el) => getComputedStyle(el).color)).toBe(
          "rgb(255, 255, 255)",
        );
      }
      await button.hover();
      expect(await button.evaluate(appearance)).not.toEqual(before);
      expect(
        await button.evaluate((el) => getComputedStyle(el).boxShadow),
      ).not.toBe("none");
    }
  },
);

test("vector logo has editable text and no embedded raster image", async () => {
  expect(await page.locator(".brand-name").textContent()).toBe("CONCRETDESIGN");
  expect(await page.locator(".brand-tagline").textContent()).toBe(
    "REVESTIMENTOS DECORATIVOS",
  );
  expect(await page.locator(".brand-symbol").getAttribute("src")).toBe(
    "/images/brand-symbol.svg",
  );
  await page.setViewportSize({ width: 1180, height: 204 });
  await page.goto(`${baseUrl}/images/concretdesign-logo-preview.svg`);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      document.fonts.check("37px ConcretReferenceName"),
    ),
  ).toBe(true);
  expect(await page.locator("text").count()).toBe(2);
  expect(await page.locator("image").count()).toBe(0);
  expect(await page.locator("text").first().textContent()).toBe(
    "CONCRETDESIGN",
  );
  await page.screenshot({ path: "test-results/logo-preview.png" });
});
