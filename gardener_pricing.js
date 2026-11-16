/**
 * Smart Pricing & Offer Optimization Engine - Gardener Service
 */

// -------------------------------------------------------------
// Core Engine Function (User-defined Specification)
// -------------------------------------------------------------
function smartPricingAndOfferEngine(input) {
  const BASE_PRICE = input.basePrice !== undefined ? Number(input.basePrice) : 500;

  const locationFactor = {
    urban: 1.2,
    semiUrban: 1.0,
    rural: 0.8
  };

  const seasonFactor = {
    summer: 1.3,
    monsoon: 1.1,
    winter: 0.9
  };

  function demandMultiplier(demand) {
    if (demand === "high") return 1.25;
    if (demand === "medium") return 1.0;
    return 0.85;
  }

  function competitionAdjustment(competitorPrice) {
    if (competitorPrice < BASE_PRICE) return 0.95;
    return 1.05;
  }

  function predictDiscountEffectiveness(discount, demand) {
    if (discount >= 25 && demand === "low") return "High Impact";
    if (discount <= 10 && demand === "high") return "Low Impact";
    return "Moderate Impact";
  }

  function recommendOffer(demand, season) {
    if (demand === "low") {
      return "20% discount on first gardener service";
    }
    if (season === "summer") {
      return "Free lawn trimming with booking";
    }
    return "10% loyalty discount";
  }

  // Factor Calculations
  const locMult = locationFactor[input.location] || 1.0;
  const demMult = demandMultiplier(input.demand);
  const seasMult = seasonFactor[input.season] || 1.0;
  const compMult = competitionAdjustment(input.competitorPrice);

  let price = BASE_PRICE;
  price *= locMult;
  price *= demMult;
  price *= seasMult;
  price *= compMult;

  const finalPrice = Math.round(price);
  const discountEffect = predictDiscountEffectiveness(
    input.discountPercent,
    input.demand
  );
  const recommendedOffer = recommendOffer(
    input.demand,
    input.season
  );

  return {
    optimalPrice: finalPrice,
    discountEffectiveness: discountEffect,
    recommendedOffer: recommendedOffer,
    // Detailed factor breakdown for UI inspection
    breakdown: {
      basePrice: BASE_PRICE,
      locationMultiplier: locMult,
      demandMultiplier: demMult,
      seasonMultiplier: seasMult,
      competitionMultiplier: compMult,
      combinedMultiplier: Number((locMult * demMult * seasMult * compMult).toFixed(4))
    }
  };
}

// -------------------------------------------------------------
// Interactive UI Controller & Real-Time Sync
// -------------------------------------------------------------

const presets = {
  userExample: {
    basePrice: 500,
    location: "urban",
    demand: "medium",
    season: "summer",
    competitorPrice: 480,
    discountPercent: 20
  },
  peakSummer: {
    basePrice: 500,
    location: "urban",
    demand: "high",
    season: "summer",
    competitorPrice: 550,
    discountPercent: 10
  },
  monsoonRural: {
    basePrice: 500,
    location: "rural",
    demand: "medium",
    season: "monsoon",
    competitorPrice: 450,
    discountPercent: 15
  },
  winterLowDemand: {
    basePrice: 500,
    location: "semiUrban",
    demand: "low",
    season: "winter",
    competitorPrice: 490,
    discountPercent: 30
  },
  heavyCompetition: {
    basePrice: 500,
    location: "urban",
    demand: "low",
    season: "summer",
    competitorPrice: 380,
    discountPercent: 25
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const basePriceInput = document.getElementById("basePriceInput");
  const competitorRange = document.getElementById("competitorRange");
  const competitorValDisplay = document.getElementById("competitorValDisplay");
  const competitorHint = document.getElementById("competitorHint");
  
  const discountRange = document.getElementById("discountRange");
  const discountValDisplay = document.getElementById("discountValDisplay");

  const optimalPriceDisplay = document.getElementById("optimalPriceDisplay");
  const priceDeltaBadge = document.getElementById("priceDeltaBadge");

  const chipBase = document.getElementById("chipBase");
  const chipLoc = document.getElementById("chipLoc");
  const chipDemand = document.getElementById("chipDemand");
  const chipSeason = document.getElementById("chipSeason");
  const chipComp = document.getElementById("chipComp");

  const impactBadge = document.getElementById("impactBadge");
  const impactDesc = document.getElementById("impactDesc");
  const gaugeFill = document.getElementById("gaugeFill");

  const recommendedOfferTitle = document.getElementById("recommendedOfferTitle");
  const offerRuleReason = document.getElementById("offerRuleReason");

  const grossRevenueVal = document.getElementById("grossRevenueVal");
  const estimatedCostVal = document.getElementById("estimatedCostVal");
  const netProfitVal = document.getElementById("netProfitVal");

  const jsonCodeBlock = document.getElementById("jsonCodeBlock");
  const jsEngineCodeBlock = document.getElementById("jsEngineCodeBlock");

  const presetBtns = document.querySelectorAll(".preset-btn");
  const resetInputsBtn = document.getElementById("resetInputsBtn");
  const copyJsonBtn = document.getElementById("copyJsonBtn");

  const tabBtns = document.querySelectorAll(".tab-btn");
  const jsonView = document.getElementById("jsonView");
  const codeView = document.getElementById("codeView");

  // Display raw engine code in tab
  if (jsEngineCodeBlock) {
    jsEngineCodeBlock.textContent = smartPricingAndOfferEngine.toString();
  }

  // Get current form data
  function getFormData() {
    const basePrice = Number(basePriceInput.value) || 500;
    const location = document.querySelector('input[name="location"]:checked')?.value || "urban";
    const demand = document.querySelector('input[name="demand"]:checked')?.value || "medium";
    const season = document.querySelector('input[name="season"]:checked')?.value || "summer";
    const competitorPrice = Number(competitorRange.value);
    const discountPercent = Number(discountRange.value);

    return {
      basePrice,
      location,
      demand,
      season,
      competitorPrice,
      discountPercent
    };
  }

  // Update UI with calculated results
  function calculateAndUpdate() {
    const input = getFormData();
    const result = smartPricingAndOfferEngine(input);

    // 1. Update Price & Delta
    optimalPriceDisplay.textContent = result.optimalPrice.toLocaleString();
    const pctChange = (((result.optimalPrice - input.basePrice) / input.basePrice) * 100).toFixed(1);
    if (pctChange >= 0) {
      priceDeltaBadge.textContent = `+${pctChange}% vs Base`;
      priceDeltaBadge.className = "badge badge-success";
    } else {
      priceDeltaBadge.textContent = `${pctChange}% vs Base`;
      priceDeltaBadge.className = "badge badge-accent";
    }

    // 2. Update Multiplier Chips
    chipBase.textContent = `Base: ₹${result.breakdown.basePrice}`;
    chipLoc.textContent = `Loc: ${result.breakdown.locationMultiplier}x`;
    chipDemand.textContent = `Demand: ${result.breakdown.demandMultiplier}x`;
    chipSeason.textContent = `Season: ${result.breakdown.seasonMultiplier}x`;
    chipComp.textContent = `Comp: ${result.breakdown.competitionMultiplier}x`;

    // 3. Competitor Hint text
    if (input.competitorPrice < input.basePrice) {
      competitorHint.textContent = `Competitor (₹${input.competitorPrice}) < Base (₹${input.basePrice}) → 0.95x Adj`;
      competitorHint.style.color = "var(--accent-gold)";
    } else {
      competitorHint.textContent = `Competitor (₹${input.competitorPrice}) ≥ Base (₹${input.basePrice}) → 1.05x Adj`;
      competitorHint.style.color = "var(--accent-bright)";
    }

    // 4. Discount Impact & Gauge
    impactBadge.textContent = result.discountEffectiveness;
    impactBadge.className = "impact-badge";
    
    if (result.discountEffectiveness === "High Impact") {
      impactBadge.classList.add("high");
      gaugeFill.style.width = "95%";
      gaugeFill.style.background = "linear-gradient(90deg, #10b981, #00e676)";
      impactDesc.textContent = `${input.discountPercent}% discount in a Low demand phase triggers strong conversion intent.`;
    } else if (result.discountEffectiveness === "Low Impact") {
      impactBadge.classList.add("low");
      gaugeFill.style.width = "25%";
      gaugeFill.style.background = "linear-gradient(90deg, #ff5252, #ff7675)";
      impactDesc.textContent = `${input.discountPercent}% discount is too low to drive additional uplift during High demand.`;
    } else {
      gaugeFill.style.width = "60%";
      gaugeFill.style.background = "linear-gradient(90deg, #f39c12, #00e676)";
      impactDesc.textContent = `${input.discountPercent}% discount yields balanced conversion without sacrificing margins.`;
    }

    // 5. Recommended Offer Reason
    recommendedOfferTitle.textContent = result.recommendedOffer;
    if (input.demand === "low") {
      offerRuleReason.textContent = "Triggered by Low Demand Rule (First-time Customer Boost)";
    } else if (input.season === "summer") {
      offerRuleReason.textContent = "Triggered by Summer Season Rule (High Lawn Growth)";
    } else {
      offerRuleReason.textContent = "Triggered by General Customer Retention Rule";
    }

    // 6. Financial Analytics Projections
    const gross100 = result.optimalPrice * 100;
    const estLaborCost = Math.round(input.basePrice * 0.45); // ~45% base cost estimate
    const totalMargin = ((result.optimalPrice - estLaborCost) / result.optimalPrice) * 100;

    grossRevenueVal.textContent = `₹${gross100.toLocaleString()}`;
    estimatedCostVal.textContent = `₹${estLaborCost} / job`;
    netProfitVal.textContent = `${totalMargin.toFixed(1)}%`;

    // 7. Render JSON Payload Output
    const jsonOutput = {
      input: input,
      output: {
        optimalPrice: result.optimalPrice,
        discountEffectiveness: result.discountEffectiveness,
        recommendedOffer: result.recommendedOffer
      },
      breakdown: result.breakdown
    };

    jsonCodeBlock.textContent = JSON.stringify(jsonOutput, null, 2);
  }

  // Apply Preset Scenario
  function applyPreset(presetKey) {
    const data = presets[presetKey];
    if (!data) return;

    basePriceInput.value = data.basePrice;
    
    // Set radio buttons
    const locRadio = document.querySelector(`input[name="location"][value="${data.location}"]`);
    if (locRadio) locRadio.checked = true;

    const demRadio = document.querySelector(`input[name="demand"][value="${data.demand}"]`);
    if (demRadio) demRadio.checked = true;

    const seasRadio = document.querySelector(`input[name="season"][value="${data.season}"]`);
    if (seasRadio) seasRadio.checked = true;

    // Set sliders
    competitorRange.value = data.competitorPrice;
    competitorValDisplay.textContent = `₹${data.competitorPrice}`;

    discountRange.value = data.discountPercent;
    discountValDisplay.textContent = `${data.discountPercent}%`;

    // Update active state on preset buttons
    presetBtns.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.preset === presetKey);
    });

    calculateAndUpdate();
  }

  // Event Listeners
  basePriceInput.addEventListener("input", calculateAndUpdate);

  document.querySelectorAll('input[name="location"]').forEach(el => el.addEventListener("change", calculateAndUpdate));
  document.querySelectorAll('input[name="demand"]').forEach(el => el.addEventListener("change", calculateAndUpdate));
  document.querySelectorAll('input[name="season"]').forEach(el => el.addEventListener("change", calculateAndUpdate));

  competitorRange.addEventListener("input", (e) => {
    competitorValDisplay.textContent = `₹${e.target.value}`;
    calculateAndUpdate();
  });

  discountRange.addEventListener("input", (e) => {
    discountValDisplay.textContent = `${e.target.value}%`;
    calculateAndUpdate();
  });

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      applyPreset(btn.dataset.preset);
    });
  });

  resetInputsBtn.addEventListener("click", () => {
    applyPreset("userExample");
  });

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (btn.dataset.tab === "json") {
        jsonView.classList.remove("hidden");
        codeView.classList.add("hidden");
      } else {
        codeView.classList.remove("hidden");
        jsonView.classList.add("hidden");
      }
    });
  });

  // Copy JSON Output
  copyJsonBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(jsonCodeBlock.textContent).then(() => {
      const originalText = copyJsonBtn.textContent;
      copyJsonBtn.textContent = "✅ Copied!";
      setTimeout(() => {
        copyJsonBtn.textContent = originalText;
      }, 1800);
    });
  });

  // Initial Run with Default Example
  calculateAndUpdate();
});
