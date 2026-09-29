import footerTemplate from "./footer.html?raw";
import headerTemplate from "./header.html?raw";

function renderTemplate(template, values) {
  return template.replace(/{{(\w+)}}/g, (_, key) => values[key] ?? "");
}

export function renderHeader(values) {
  return renderTemplate(headerTemplate, values);
}

export function renderFooter(values) {
  return renderTemplate(footerTemplate, values);
}
