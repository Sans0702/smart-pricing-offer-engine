/**
 * @typedef {Object} PricingInput
 * @property {("urban"|"semiUrban"|"rural")} location - Service geographic tier
 * @property {("high"|"medium"|"low")} demand - Current market demand level
 * @property {("summer"|"monsoon"|"winter")} season - Active season
 * @property {number} competitorPrice - Average market competitor price
 * @property {number} discountPercent - Target discount percentage offered (0-100)
 * @property {number} [basePrice=500] - Base rate for gardener service
 */

/**
 * @typedef {Object} PricingResult
 * @property {number} optimalPrice - Final calculated price rounded to nearest integer
 * @property {("High Impact"|"Moderate Impact"|"Low Impact")} discountEffectiveness - Predicted effectiveness of discount
 * @property {string} recommendedOffer - Automated promo offer recommendation
 * @property {Object} breakdown - Factor multipliers breakdown
 */

/**
 * Smart Pricing & Offer Optimization Engine
 * Calculates dynamic service rates and offer recommendations based on market factors.
 * 
 * @param {PricingInput} input 
 * @returns {PricingResult}
 */
function smartPricingAndOfferEngine(input) {
  // Input Validation & Fallbacks
  if (!input || typeof input !== "object") {
    throw new Error("Invalid input: Expected a configuration object.");
  }

  const BASE_PRICE = typeof input.basePrice === "number" && input.basePrice > 0 ? input.basePrice : 500;

  // Factor Lookup Maps
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

  /**
   * Evaluates demand multiplier
   * @param {string} demand 
   * @returns {number}
   */
  function demandMultiplier(demand) {
    if (demand === "high") return 1.25;
    if (demand === "medium") return 1.0;  
    return 0.85; // Low demand
  }

  /**
   * Adjusts price based on competitor positioning
   * @param {number} competitorPrice 
   * @returns {number}
   */
  function competitionAdjustment(competitorPrice) {
    if (typeof competitorPrice === "number" && competitorPrice < BASE_PRICE) {
      return 0.95; // Competitive discount adjustment
    }
    return 1.05; // Premium market markup
  }

  /**
   * Predicts discount impact given demand levels
   * @param {number} discount 
   * @param {string} demand 
   * @returns {string}
   */
  function predictDiscountEffectiveness(discount, demand) {
    if (discount >= 25 && demand === "low") return "High Impact";
    if (discount <= 10 && demand === "high") return "Low Impact";
    return "Moderate Impact";
  }

  /**
   * Recommends contextual promotional offers
   * @param {string} demand 
   * @param {string} season 
   * @returns {string}
   */
  function recommendOffer(demand, season) {
    if (demand === "low") {
      return "20% discount on first gardener service";
    }
    if (season === "summer") {
      return "Free lawn trimming with booking";
    }
    return "10% loyalty discount";
  }

  // Multipliers computation
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

// Node.js module export support
if (typeof module !== "undefined" && module.exports) {
  module.exports = { smartPricingAndOfferEngine };
}

// Direct Execution / Test Run Example
if (require.main === module) {
  const sampleUserData = {
    location: "urban",
    demand: "medium",
    season: "summer",
    competitorPrice: 480,
    discountPercent: 20
  };

  const result = smartPricingAndOfferEngine(sampleUserData);
  console.log("=== Smart Pricing Engine Output ===");
  console.log(JSON.stringify(result, null, 2));
}
