(function (global) {
  function roundMoney(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function calculateRisk(probability, severity) {
    const p = Math.max(0, Number(probability) || 0);
    const s = Math.max(0, Number(severity) || 0);
    const criticality = p * s;
    let level = "LOW";
    if (criticality > 16) level = "CRITICAL";
    else if (criticality > 9) level = "HIGH";
    else if (criticality > 4) level = "MEDIUM";
    return { criticality, level };
  }

  function costSummary(items) {
    const byCategory = {};
    let total = 0;
    for (const item of items || []) {
      const line = roundMoney(Math.max(0, item.quantity) * Math.max(0, item.unitCost));
      total = roundMoney(total + line);
      byCategory[item.category] = roundMoney((byCategory[item.category] || 0) + line);
    }
    return { total, byCategory, itemCount: (items || []).length };
  }

  const pricingFields = ["indirectCost", "contingency", "riskReserve", "taxAmount", "marginAmount", "discountAmount"];

  function calculateQuote(costBase, pricing) {
    const missingFields = pricingFields.filter(field => pricing[field] === null || pricing[field] === undefined || !Number.isFinite(pricing[field]) || pricing[field] < 0);
    if (missingFields.length) return { complete:false, valid:false, salePrice:null, missingFields };

    const salePrice = roundMoney(
      roundMoney(costBase) +
      pricing.indirectCost +
      pricing.contingency +
      pricing.riskReserve +
      pricing.taxAmount +
      pricing.marginAmount -
      pricing.discountAmount
    );
    return salePrice < 0
      ? { complete:true, valid:false, salePrice:null, missingFields:[], error:"NEGATIVE_SALE_PRICE" }
      : { complete:true, valid:true, salePrice, missingFields:[] };
  }

  function deriveReadiness(input) {
    const signals = [
      input.requirementsTotal === 0
        ? { key:"REQUIREMENTS", status:"MISSING", detail:"No requirements registered." }
        : input.blockedRequirements > 0
          ? { key:"REQUIREMENTS", status:"ATTENTION", detail:`${input.blockedRequirements} blocked requirement(s).` }
          : { key:"REQUIREMENTS", status:"AVAILABLE", detail:`${input.requirementsTotal} requirement(s) registered.` },
      input.scopeItemsTotal > 0
        ? { key:"SCOPE", status:"AVAILABLE", detail:`${input.scopeItemsTotal} scope item(s) registered.` }
        : { key:"SCOPE", status:"MISSING", detail:"Scope not registered." },
      input.risksTotal === 0
        ? { key:"RISKS", status:"MISSING", detail:"No risk analysis registered." }
        : input.highOrCriticalOpenRisks > 0
          ? { key:"RISKS", status:"ATTENTION", detail:`${input.highOrCriticalOpenRisks} high/critical open risk(s).` }
          : { key:"RISKS", status:"AVAILABLE", detail:`${input.risksTotal} risk(s), no high/critical open.` },
      input.selectedConcept
        ? { key:"CONCEPT", status:"AVAILABLE", detail:"A concept variant is explicitly selected." }
        : { key:"CONCEPT", status:"MISSING", detail:"No concept selected." },
      input.selectedConcept && input.evaluationComplete
        ? { key:"EVALUATION", status:"AVAILABLE", detail:"Selected concept evaluation is complete." }
        : { key:"EVALUATION", status:"MISSING", detail:"Selected concept evaluation is incomplete." },
      input.costItemsTotal > 0
        ? { key:"COSTS", status:"AVAILABLE", detail:`${input.costItemsTotal} cost item(s) registered.` }
        : { key:"COSTS", status:"MISSING", detail:"No cost items registered." },
      input.quoteComplete
        ? { key:"QUOTE", status:"AVAILABLE", detail:"Commercial quote is complete." }
        : { key:"QUOTE", status:"MISSING", detail:"Commercial quote has missing pricing inputs." }
    ];

    const missing = signals.filter(x => x.status === "MISSING");
    const attention = signals.filter(x => x.status === "ATTENTION");
    let state = "READY_FOR_HUMAN_DECISION";
    if (missing.length) state = "HOLD_FOR_INFORMATION";
    else if (attention.length) state = "REVIEW_WITH_CONDITIONS";

    return { signals, missing, attention, state };
  }

  global.CPEngineeringLogic = { roundMoney, calculateRisk, costSummary, calculateQuote, deriveReadiness };
})(typeof window !== "undefined" ? window : globalThis);
