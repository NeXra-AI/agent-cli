// nexra shop <sub> ... — Shop ops commands
import { apiFetch, ApiError } from "../auth/client.js";
import { color, logError, logInfo } from "../util/ui.js";

export async function shopCmd(args: string[]) {
  const [sub, ...rest] = args;
  if (!sub || sub === "--help") {
    printHelp();
    return;
  }
  switch (sub) {
    case "products":
      return productsCmd(rest);
    case "orders":
      return ordersCmd(rest);
    case "customers":
      return customersCmd(rest);
    default:
      logError(`Unknown shop subcommand: ${sub}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log();
  console.log(color.bold("nexra shop <sub>") + " — Shop ops commands");
  console.log();
  console.log("  " + color.cyan("products list") + "         List products");
  console.log("  " + color.cyan("orders list") + "           List orders");
  console.log("  " + color.cyan("customers list") + "        List customers");
  console.log();
}

async function productsCmd(args: string[]) {
  const sub = args[0];
  if (sub !== "list") {
    logInfo("Try: nexra shop products list");
    return;
  }
  try {
    const r = await apiFetch<any>("/api/admin/products", {
      query: { limit: 20 },
    });
    const items = r.items || r.data || r.products || [];
    if (!items.length) {
      console.log(color.gray("No products."));
      return;
    }
    console.log();
    for (const p of items.slice(0, 20)) {
      console.log(
        `  ${color.cyan((p.id || p.code || "?").toString().padEnd(10))} ` +
          `${(p.name || p.title || "(unnamed)").padEnd(40)} ` +
          color.gray(`RM ${p.price || p.retail_price || "?"}`)
      );
    }
    console.log();
    console.log(color.gray(`  Showing ${Math.min(20, items.length)} of ${r.total ?? items.length}`));
    console.log();
  } catch (e) {
    handleErr(e);
  }
}

async function ordersCmd(args: string[]) {
  const sub = args[0];
  if (sub !== "list") {
    logInfo("Try: nexra shop orders list");
    return;
  }
  try {
    const r = await apiFetch<any>("/api/admin/orders", { query: { limit: 20 } });
    const items = r.items || r.data || r.orders || [];
    if (!items.length) {
      console.log(color.gray("No orders."));
      return;
    }
    console.log();
    for (const o of items.slice(0, 20)) {
      console.log(
        `  ${color.cyan((o.order_no || o.id || "?").toString().padEnd(14))} ` +
          `${(o.status || "").padEnd(12)} ` +
          color.gray(`RM ${o.total || o.amount || "?"}`)
      );
    }
    console.log();
  } catch (e) {
    handleErr(e);
  }
}

async function customersCmd(args: string[]) {
  const sub = args[0];
  if (sub !== "list") {
    logInfo("Try: nexra shop customers list");
    return;
  }
  try {
    const r = await apiFetch<any>("/api/admin/customers", { query: { limit: 20 } });
    const items = r.items || r.data || r.customers || [];
    if (!items.length) {
      console.log(color.gray("No customers."));
      return;
    }
    console.log();
    for (const c of items.slice(0, 20)) {
      console.log(
        `  ${color.cyan((c.id || c.phone || "?").toString().padEnd(14))} ` +
          `${(c.name || "(unnamed)").padEnd(24)} ` +
          color.gray(c.email || c.phone || "")
      );
    }
    console.log();
  } catch (e) {
    handleErr(e);
  }
}

function handleErr(e: unknown) {
  if (e instanceof ApiError) {
    logError(`API error ${e.status}: ${JSON.stringify(e.body).slice(0, 200)}`);
  } else {
    logError((e as Error).message);
  }
  process.exit(1);
}
