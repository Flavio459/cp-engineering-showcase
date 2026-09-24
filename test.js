require("./logic.js");
const assert = require("node:assert/strict");
const L = globalThis.CPEngineeringLogic;

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log("PASS", name);
}

test("risk calculation classifies 3x4 as HIGH", () => {
  assert.deepEqual(L.calculateRisk(3,4), {criticality:12,level:"HIGH"});
});

test("cost summary is deterministic", () => {
  const result = L.costSummary([
    {category:"MATERIAL",quantity:2,unitCost:10.125},
    {category:"ENGINEERING",quantity:1,unitCost:20}
  ]);
  assert.equal(result.total,40.25);
  assert.equal(result.itemCount,2);
});

test("quote remains incomplete when one field is unknown", () => {
  const result = L.calculateQuote(1000,{
    indirectCost:100,contingency:50,riskReserve:25,taxAmount:null,marginAmount:100,discountAmount:0
  });
  assert.equal(result.complete,false);
  assert.ok(result.missingFields.includes("taxAmount"));
});

test("complete quote calculates sale price", () => {
  const result = L.calculateQuote(1000,{
    indirectCost:100,contingency:50,riskReserve:25,taxAmount:80,marginAmount:100,discountAmount:10
  });
  assert.equal(result.valid,true);
  assert.equal(result.salePrice,1345);
});

test("missing quote holds decision readiness", () => {
  const r=L.deriveReadiness({
    requirementsTotal:8,blockedRequirements:0,scopeItemsTotal:6,risksTotal:4,highOrCriticalOpenRisks:0,
    selectedConcept:true,evaluationComplete:true,costItemsTotal:4,quoteComplete:false
  });
  assert.equal(r.state,"HOLD_FOR_INFORMATION");
});

test("attention items do not create automatic GO", () => {
  const r=L.deriveReadiness({
    requirementsTotal:8,blockedRequirements:1,scopeItemsTotal:6,risksTotal:4,highOrCriticalOpenRisks:1,
    selectedConcept:true,evaluationComplete:true,costItemsTotal:4,quoteComplete:true
  });
  assert.equal(r.state,"REVIEW_WITH_CONDITIONS");
});

test("complete readiness still requires human decision", () => {
  const r=L.deriveReadiness({
    requirementsTotal:8,blockedRequirements:0,scopeItemsTotal:6,risksTotal:4,highOrCriticalOpenRisks:0,
    selectedConcept:true,evaluationComplete:true,costItemsTotal:4,quoteComplete:true
  });
  assert.equal(r.state,"READY_FOR_HUMAN_DECISION");
  assert.notEqual(r.state,"GO");
});

console.log(`\n${passed} tests passed`);
