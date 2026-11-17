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
  expect(await page.locator(".project-carousel").count()).toBe(1);
  expect(await page.locator(".carousel-slide--active").count()).toBe(1);
  expect(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.every((img) => !img.complete || img.naturalWidth > 0),
      ),
  ).toBe(true);
  await page.locator(".carousel-slide--active .carousel-caption").click();
  await page.locator(".gallery-page").waitFor();
  await page.locator('.gallery-card[href="/projects/hotel"]').click();
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
  await page.goto(`${baseUrl}/orcamento`);
  await page.waitForFunction(() => document.documentElement.lang === "en");
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
  expect(await page.locator(".gallery-card").count()).toBe(7);
  await page.getByRole("radio", { name: /Microcimento/ }).check();
  expect(await page.locator(".gallery-card").count()).toBe(2);
  await page.locator(".gallery-card").first().click();
  expect(page.url()).toContain("/projects/hotel");
});
test("submits a quote through the actual API and persists an encrypted record", async () => {
  await page.locator(".header-quote").click();
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
  await page.locator(".header-quote").click();
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
    const about = page.locator("#sobre");
    await about.scrollIntoViewIfNeeded();
    await about.locator("img").evaluate((img) => img.decode());
    await about.screenshot({ path: `test-results/about-brand-${theme}.png` });
    await page.setViewportSize({ width: 375, height: 1200 });
    await about.screenshot({
      path: `test-results/about-brand-mobile-${theme}.png`,
    });
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
      if (selector === ".quote-form > .button")
        await page.locator(".header-quote").click();
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

test.each(["dark", "light"])(
  "smoked header overlays the hero image in %s theme",
  async (theme) => {
    if (theme === "light") await page.getByRole("switch").click();
    for (const width of [375, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      const header = await page.locator(".header").boundingBox();
      const hero = await page.locator(".hero").boundingBox();
      const image = await page.locator(".hero-image").boundingBox();
      const content = await page.locator(".hero-content").boundingBox();
      expect(header.y).toBe(0);
      expect(hero.y).toBe(0);
      expect(image.y).toBe(0);
      expect(content.y).toBeGreaterThanOrEqual(header.height);
      const smoke = await page.locator(".header").evaluate((el) => ({
        background: getComputedStyle(el).backgroundColor,
        blur: getComputedStyle(el).backdropFilter,
      }));
      expect(smoke.background).toBe("rgba(24, 23, 22, 0.68)");
      expect(smoke.blur).toContain("blur(8px)");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.evaluate(() => window.scrollTo(0, 500));
      expect((await page.locator(".header").boundingBox()).y).toBe(0);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/smoked-header-${theme}.png` });
    await page.goto(`${baseUrl}/portfolio`);
    expect(await page.locator(".header--overlay").count()).toBe(0);
    const header = await page.locator(".header").boundingBox();
    expect((await page.locator("main").boundingBox()).y).toBeGreaterThanOrEqual(
      header.y + header.height,
    );
  },
);

test("carousel loops and its captions open the searchable, filtered gallery", async () => {
  const carousel = page.locator(".project-carousel");
  await carousel.scrollIntoViewIfNeeded();
  await carousel.screenshot({ path: "test-results/project-carousel-dark.png" });
  expect(
    await carousel.evaluate((el) =>
      Math.round(el.getBoundingClientRect().width),
    ),
  ).toBe(await page.evaluate(() => document.body.clientWidth));
  await page
    .getByRole("button", { name: "Projeto anterior", exact: true })
    .click();
  expect(
    await page.locator(".carousel-slide--active img").getAttribute("src"),
  ).toBe("/images/house.webp");
  await page
    .getByRole("button", { name: "Próximo projeto", exact: true })
    .click();
  expect(
    await page.locator(".carousel-slide--active img").getAttribute("src"),
  ).toBe("/images/hotel.webp");
  const caption = page.locator(".carousel-slide--active .carousel-caption");
  await caption.click();
  const gallery = page.locator(".gallery-page");
  await gallery.waitFor();
  expect(await gallery.isVisible()).toBe(true);
  expect(await gallery.locator(".gallery-card").count()).toBe(7);
  await gallery.getByRole("radio", { name: /Marmorino/ }).check();
  expect(await gallery.locator(".gallery-card").count()).toBe(2);
  await gallery.getByRole("searchbox").fill("Cascais");
  expect(await gallery.locator(".gallery-card").count()).toBe(1);
  await gallery.getByRole("searchbox").fill("nonexistent");
  expect(await gallery.locator(".gallery-empty").isVisible()).toBe(true);
  await gallery
    .getByRole("button", { name: "Limpar filtros", exact: true })
    .last()
    .click();
  expect(await gallery.locator(".gallery-card").count()).toBe(7);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.screenshot({ path: "test-results/project-gallery-dark.png" });
  expect(page.url()).toContain("/portfolio?project=hotel");
  expect(await page.getByRole("dialog").count()).toBe(0);
});

test("carousel gallery adapts to mobile and the light theme", async () => {
  await page.getByRole("switch").click();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator(".carousel-slide--active .carousel-caption").click();
  const gallery = page.locator(".gallery-page");
  await gallery.locator(".gallery-mobile-finish select").selectOption("micro");
  expect(await gallery.locator(".gallery-card").count()).toBe(2);
  await gallery.locator(".gallery-category select").selectOption("home");
  expect(await gallery.locator(".gallery-card").count()).toBe(1);
  expect(
    await gallery.evaluate((el) => el.scrollWidth <= window.innerWidth),
  ).toBe(true);
  await page.screenshot({ path: "test-results/project-gallery-mobile.png" });
  await gallery
    .getByRole("link", { name: "Voltar à página inicial", exact: true })
    .click();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("carousel zooms and auto-advances only while visible, and can be paused", async () => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await page.locator(".project-carousel").scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".project-carousel"))
        .getPropertyValue("--zoom-play-state")
        .trim() === "running",
  );
  const first = await page
    .locator(".carousel-slide--active img")
    .getAttribute("src");
  await page.waitForFunction(
    () =>
      Number(
        getComputedStyle(document.querySelector(".carousel-slide--active img"))
          .transform.split(",")[0]
          .replace("matrix(", ""),
      ) > 1.002,
  );
  await page.waitForFunction(
    (src) =>
      document
        .querySelector(".carousel-slide--active img")
        ?.getAttribute("src") !== src,
    first,
    { timeout: 10000 },
  );
  await page
    .getByRole("button", { name: "Pausar apresentação", exact: true })
    .click();
  expect(
    await page
      .locator(".project-carousel")
      .evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--zoom-play-state").trim(),
      ),
  ).toBe("paused");
  await page
    .getByRole("button", { name: "Retomar apresentação", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".project-carousel"))
        .getPropertyValue("--zoom-play-state")
        .trim() === "running",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".carousel-slide--active img")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});

test("animated carousel completes the seamless wrap without locking the controls", async () => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await page.locator(".project-carousel").scrollIntoViewIfNeeded();
  const next = page.getByRole("button", {
    name: "Próximo projeto",
    exact: true,
  });
  for (let index = 0; index < 7; index++) {
    await next.click();
    await page.waitForFunction(
      () => !document.querySelector(".carousel-arrow--next").disabled,
    );
  }
  expect(
    await page.locator(".carousel-slide--active img").getAttribute("src"),
  ).toBe("/images/hotel.webp");
  await next.click();
  await page.waitForFunction(
    () => !document.querySelector(".carousel-arrow--next").disabled,
  );
  expect(
    await page.locator(".carousel-slide--active img").getAttribute("src"),
  ).toBe("/images/living.webp");
});

test.each(["dark", "light"])(
  "mainland map selects regions and links their projects in %s theme",
  async (theme) => {
    if (theme === "light") await page.getByRole("switch").click();
    const section = page.locator("#cobertura");
    await section.scrollIntoViewIfNeeded();
    expect(
      await section
        .getByRole("heading", { name: "Portugal Continental", exact: true })
        .isVisible(),
    ).toBe(true);
    expect(await section.locator(".map-district").count()).toBe(18);
    expect(await section.locator(".coverage-pin").count()).toBe(3);
    expect(await section.locator(".coverage-projects li").count()).toBe(3);
    expect(
      (await section.locator(".mainland-map").boundingBox()).height,
    ).toBeGreaterThan(400);
    await section
      .getByRole("button", { name: "Algarve · 1 Projetos", exact: true })
      .click();
    expect(await section.locator(".coverage-projects li").count()).toBe(1);
    expect(await section.locator(".map-district--selected").count()).toBe(1);
    expect(await section.locator(".coverage-selection h3").textContent()).toBe(
      "Algarve",
    );
    await section
      .locator(".coverage-region-options button")
      .filter({ hasText: "Lisboa e Vale do Tejo" })
      .click();
    expect(await section.locator(".coverage-projects li").count()).toBe(3);
    expect(
      await section.locator(".coverage-pin--active").getAttribute("aria-label"),
    ).toBe("Lisboa e Vale do Tejo · 3 Projetos");
    await section
      .getByRole("button", { name: "Norte · 3 Projetos", exact: true })
      .click();
    expect(await section.locator(".map-district--selected").count()).toBe(2);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await section.screenshot({
      path: `test-results/portugal-mainland-${theme}.png`,
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await section.scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const mobileAudit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      mobileAudit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await section.screenshot({
      path: `test-results/portugal-mainland-mobile-${theme}.png`,
    });
    await section.locator(".coverage-projects a").first().click();
    expect(page.url()).toContain("/projects/retail");
  },
);

test.each(["dark", "light"])(
  "floating WhatsApp links directly to Emilly in %s theme",
  async (theme) => {
    if (theme === "light") await page.getByRole("switch").click();
    const toggle = page.locator(".floating-whatsapp-toggle");
    expect(await toggle.getAttribute("href")).toBe(
      "https://wa.me/351963445555",
    );
    expect(await toggle.getAttribute("target")).toBe("_blank");
    expect(await toggle.getAttribute("rel")).toContain("noopener");
    expect(await toggle.getAttribute("aria-haspopup")).toBeNull();
    expect(
      await page.locator('a[href="https://wa.me/351963444880"]').count(),
    ).toBe(0);
    expect(
      await toggle.evaluate(
        (el) => getComputedStyle(el.parentElement).position,
      ),
    ).toBe("fixed");
    expect(
      await toggle.evaluate((el) => getComputedStyle(el).backgroundImage),
    ).toContain("rgb(193, 134, 89)");
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: `test-results/floating-whatsapp-${theme}.png`,
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator(".footer").scrollIntoViewIfNeeded();
    const position = await toggle.boundingBox();
    expect(position.x + position.width).toBeLessThanOrEqual(375);
    expect(position.y + position.height).toBeLessThan(812);
    const privacy = page
      .locator(".footer")
      .getByRole("link", { name: "Privacidade", exact: true });
    expect(
      await privacy.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          document
            .elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
            ?.closest("a") === el
        );
      }),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  },
);

test.each(["dark", "light"])(
  "quote page is accessible and responsive in %s",
  async (theme) => {
    if (theme === "light") await page.getByRole("switch").click();
    await page.locator(".header-quote").click();
    await page.waitForURL("**/orcamento");
    expect(await page.locator("dialog").count()).toBe(0);
    expect(await page.locator(".quote-form").count()).toBe(1);
    expect(await page.locator(".quote-mini-track img").count()).toBe(7);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.screenshot({
      path: `test-results/quote-page-${theme}.png`,
      fullPage: true,
    });
    await page.locator(".quote-next").click();
    expect(
      await page.locator(".quote-mini-controls span").textContent(),
    ).toContain("02");
    await page.setViewportSize({ width: 375, height: 812 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/quote-page-mobile-${theme}.png`,
      fullPage: true,
    });
    await page.locator(".quote-page-back").click();
    await page.waitForURL(baseUrl + "/");
  },
);

test("quote carousel images navigate to the category catalogue", async () => {
  await page.goto(`${baseUrl}/orcamento`);
  await page.locator('.quote-mini-track a[tabindex="0"]').click();
  await page.waitForURL("**/portfolio?project=hotel");
  expect(await page.locator(".gallery-sidebar").isVisible()).toBe(true);
  expect(
    await page.locator(".gallery-card--selected").getAttribute("href"),
  ).toBe("/projects/hotel");
  await page.reload();
  expect(await page.locator(".gallery-card").count()).toBe(7);
});

test("catalogue provides a valid downloadable PDF", async () => {
  await page.goto(`${baseUrl}/portfolio`);
  const link = page.locator(".gallery-download a");
  const response = await page.request.get(
    new URL(await link.getAttribute("href"), baseUrl).href,
  );
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
});

test("catalogue returns home and project detail returns to the catalogue", async () => {
  await page.goto(`${baseUrl}/portfolio`);
  const back = page
    .locator(".gallery-header")
    .getByRole("link", { name: "Voltar à página inicial", exact: true });
  expect(await back.getAttribute("href")).toBe("/");
  await back.click();
  await page.waitForURL(baseUrl + "/");
  await page.goto(`${baseUrl}/projects/hotel`);
  expect(
    await page
      .getByRole("link", { name: "Voltar ao portefólio", exact: true })
      .getAttribute("href"),
  ).toBe("/portfolio");
});

test("comparison arrow is geometrically centered inside its circular handle", async () => {
  await page.goto(`${baseUrl}/projects/hotel`);
  const offsets = await page
    .locator(".comparison-divider span")
    .evaluate((el) => {
      const circle = el.getBoundingClientRect();
      const icon = el.querySelector("svg").getBoundingClientRect();
      return {
        x: Math.abs(circle.x + circle.width / 2 - icon.x - icon.width / 2),
        y: Math.abs(circle.y + circle.height / 2 - icon.y - icon.height / 2),
      };
    });
  expect(offsets.x).toBeLessThan(0.5);
  expect(offsets.y).toBeLessThan(0.5);
});

test.each(["dark", "light"])(
  "official supplier logos and names are visible in %s",
  async (theme) => {
    if (theme === "light") await page.getByRole("switch").click();
    const section = page.locator("#fornecedores");
    await section.scrollIntoViewIfNeeded();
    expect(await section.locator("li").count()).toBe(5);
    for (const name of [
      "Gordillos Cal de Morón",
      "Colorificio Veneziano",
      "Lissonia",
      "Ecomateria",
      "Diasen Ibérica",
    ]) {
      const link = section.getByRole("link", { name, exact: true });
      expect(await link.getAttribute("href")).toMatch(/^https:\/\//);
      await link.locator("img").evaluate((img) => img.decode());
      expect(
        await link.locator("img").evaluate((img) => img.naturalWidth > 0),
      ).toBe(true);
    }
    expect(await section.locator(".suppliers-demo-note").count()).toBe(0);
    await section.screenshot({ path: `test-results/suppliers-${theme}.png` });
    await page.setViewportSize({ width: 375, height: 812 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await section.screenshot({
      path: `test-results/suppliers-mobile-${theme}.png`,
    });
  },
);

test.each(["dark", "light"])(
  "all supplier marks share the copper hover in %s",
  async (theme) => {
    if (theme === "light") await page.getByRole("switch").click();
    const links = page.locator(".suppliers-list a");
    for (let i = 0; i < (await links.count()); i++) {
      const link = links.nth(i);
      await link.hover();
      await page.waitForFunction(() =>
        [
          ...document.querySelectorAll(
            ".suppliers-list a:hover .supplier-logo-circle",
          ),
        ].some(
          (el) => getComputedStyle(el).borderTopColor === "rgb(221, 169, 121)",
        ),
      );
      const style = await link
        .locator(".supplier-logo-circle")
        .evaluate((el) => ({
          border: getComputedStyle(el).borderTopColor,
          shadow: getComputedStyle(el).boxShadow,
        }));
      expect(style.border).toBe("rgb(221, 169, 121)");
      expect(style.shadow).not.toBe("none");
    }
    const lissonia = page.locator('a[href="https://www.lissonia.pt/"] img');
    expect(await lissonia.getAttribute("src")).toContain(
      "lissonia-display.svg",
    );
    await page
      .locator("#fornecedores")
      .screenshot({ path: `test-results/suppliers-improved-${theme}.png` });
  },
);
