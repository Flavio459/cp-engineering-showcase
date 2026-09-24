const L = window.CPEngineeringLogic;
let baseline;
let state;

const fmt = value => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);
const clone = value => JSON.parse(JSON.stringify(value));

function riskView(risk) {
  const calc = L.calculateRisk(risk.probability, risk.severity);
  return { ...risk, ...calc };
}

function getSnapshot() {
  const costs = L.costSummary(state.costs);
  const quote = L.calculateQuote(costs.total, state.quote);
  const risks = state.risks.map(riskView);
  const highOpen = risks.filter(r => ["HIGH","CRITICAL"].includes(r.level) && r.status !== "CLOSED").length;
  const readiness = L.deriveReadiness({
    requirementsTotal: state.requirements.total,
    blockedRequirements: state.requirements.blocked,
    scopeItemsTotal: state.scope.items,
    risksTotal: risks.length,
    highOrCriticalOpenRisks: highOpen,
    selectedConcept: state.concept.selected,
    evaluationComplete: state.concept.evaluationComplete,
    costItemsTotal: costs.itemCount,
    quoteComplete: quote.complete && quote.valid
  });
  return { costs, quote, risks, highOpen, readiness };
}

function render() {
  const s = getSnapshot();

  document.querySelector("#project").innerHTML = `
    <div>
      <p class="eyebrow">SYNTHETIC PROJECT</p>
      <h2>${state.project.code} · ${state.project.title}</h2>
      <p class="muted">${state.project.objective}</p>
    </div>
    <div class="tags">
      <span class="tag demo">DEMO</span>
      <span class="tag">Revision ${state.project.revision}</span>
      <span class="tag">${state.project.status}</span>
    </div>`;

  document.querySelector("#kpis").innerHTML = `
    <div class="kpi"><span>Revision</span><b>${state.project.revision}</b><small>explicit baseline</small></div>
    <div class="kpi"><span>Requirements</span><b>${state.requirements.total - state.requirements.blocked}/${state.requirements.total}</b><small>${state.requirements.blocked} blocked</small></div>
    <div class="kpi"><span>High risks open</span><b>${s.highOpen}</b><small>decision attention</small></div>
    <div class="kpi"><span>Cost base</span><b>${fmt(s.costs.total)}</b><small>calculated</small></div>
    <div class="kpi"><span>Quote</span><b>${s.quote.complete ? fmt(s.quote.salePrice) : "INCOMPLETE"}</b><small>${s.quote.complete ? "calculated" : "missing input"}</small></div>`;

  const cls = s.readiness.state === "HOLD_FOR_INFORMATION" ? "hold" : s.readiness.state === "REVIEW_WITH_CONDITIONS" ? "review" : "ready";
  document.querySelector("#readiness-badge").innerHTML = `<span class="state ${cls}">${s.readiness.state.replaceAll("_"," ")}</span>`;
  document.querySelector("#signals").innerHTML = s.readiness.signals.map(x =>
    `<div class="signal ${x.status.toLowerCase()}"><span><b>${x.key}</b> · ${x.detail}</span><strong>${x.status}</strong></div>`
  ).join("");

  const quoteRows = [
    ["Cost base", s.costs.total],
    ["Indirect cost", state.quote.indirectCost],
    ["Contingency", state.quote.contingency],
    ["Risk reserve", state.quote.riskReserve],
    ["Tax amount", state.quote.taxAmount],
    ["Margin amount", state.quote.marginAmount],
    ["Discount", state.quote.discountAmount]
  ];
  document.querySelector("#quote").innerHTML =
    quoteRows.map(([label,value]) => `<div class="quote-row"><span>${label}</span><b>${value === null ? '<em class="unknown">UNKNOWN</em>' : fmt(value)}</b></div>`).join("") +
    `<div class="quote-row"><span>Sale price</span><b class="quote-total">${s.quote.valid ? fmt(s.quote.salePrice) : "NOT CALCULATED"}</b></div>`;

  document.querySelector("#risks").innerHTML = s.risks.map(r =>
    `<div class="risk-row"><span>${r.id} · ${r.title}<br><small>${r.status} · P${r.probability} × S${r.severity} = ${r.criticality}</small></span><b class="risk-level ${r.level}">${r.level}</b></div>`
  ).join("");

  document.querySelector("#provenance").innerHTML = state.provenance.map(p =>
    `<div class="prov"><b class="${p.nature.toLowerCase()}">${p.nature}</b><p><strong>${p.label}</strong><br>${p.note}</p></div>`
  ).join("");

  const gateText = s.readiness.state === "READY_FOR_HUMAN_DECISION"
    ? "All readiness signals are available. The system still does not issue GO/NO-GO automatically. A qualified human must review the revision, evidence and engineering context."
    : "Human decision is not ready. Missing information or attention items remain visible and block automatic approval.";
  document.querySelector("#human-gate").innerHTML = `<strong>HUMAN GATE</strong><br>${gateText}`;

  document.querySelector("#resolve-requirement").disabled = state.requirements.blocked === 0;
  document.querySelector("#close-risk").disabled = !state.risks.some(r => r.id === "R-01" && r.status !== "CLOSED");
  document.querySelector("#provide-tax").disabled = state.quote.taxAmount !== null;
}

document.querySelector("#resolve-requirement").addEventListener("click",()=>{state.requirements.blocked=0;render();});
document.querySelector("#close-risk").addEventListener("click",()=>{const r=state.risks.find(x=>x.id==="R-01");if(r)r.status="CLOSED";render();});
document.querySelector("#provide-tax").addEventListener("click",()=>{state.quote.taxAmount=6200;const p=state.provenance.find(x=>x.label==="Tax amount");if(p){p.nature="ESTIMATED";p.note="Synthetic tax estimate supplied interactively."}render();});
document.querySelector("#reset").addEventListener("click",()=>{state=clone(baseline);render();});

fetch("data/project.json").then(r=>r.json()).then(data=>{baseline=data;state=clone(data);render();}).catch(()=>{
  document.querySelector("#project").innerHTML='<p>Could not load synthetic project data.</p>';
});
