/**
 * Detects Cross-Bank fraud patterns
 */
export const detectCrossBankPattern = async (sourceBankId, targetBankId) => {
  // If we had more sophisticated logic, we might check a blacklist of banks
  // or a very quick routing of funds between offshore locations.
  // For now, simple heuristic:
  const offshoreBanks = ['CAYMAN_BANK', 'BVI_TRUST'];
  
  if (offshoreBanks.includes(targetBankId) && sourceBankId !== targetBankId) {
    return {
      detected: true,
      confidence: 0.80,
      explanation: `High risk cross-bank transfer to offshore entity (${targetBankId})`
    };
  }

  return { detected: false, confidence: 0, explanation: "" };
};
