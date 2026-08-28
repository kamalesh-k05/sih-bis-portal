import { IS_CODE_WHITELIST_SET, IndianStandard } from '../data/standards';

export interface HallucinationCheckResult {
  isValid: boolean;
  codesFound: string[];
  validCodes: string[];
  invalidCodes: string[];
  warnings: string[];
  recommendation: string;
}

export function validateResponse(responseText: string): HallucinationCheckResult {
  const isCodePattern = /IS\s*\d+(\.\d+)?/gi;
  const codesFound = [...new Set((responseText.match(isCodePattern) || []).map(c => c.trim().toUpperCase()))];

  const validCodes: string[] = [];
  const invalidCodes: string[] = [];
  const warnings: string[] = [];

  for (const code of codesFound) {
    if (IS_CODE_WHITELIST_SET.has(code)) {
      validCodes.push(code);
    } else {
      invalidCodes.push(code);
      warnings.push(`${code} is not in our verified standards database.`);
    }
  }

  const isValid = invalidCodes.length === 0;

  let recommendation = '';
  if (!isValid) {
    recommendation = 'This response contains unverified IS codes. Please verify through official BIS services before acting on this information.';
  } else if (validCodes.length > 0) {
    recommendation = 'All referenced IS codes have been verified against our standards database.';
  } else {
    recommendation = 'No IS codes were referenced in this response.';
  }

  return {
    isValid,
    codesFound,
    validCodes,
    invalidCodes,
    warnings,
    recommendation,
  };
}

export function isVerifiedISCode(code: string): boolean {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, ' ');
  return IS_CODE_WHITELIST_SET.has(normalized);
}

export function sanitizeResponse(response: string): string {
  const check = validateResponse(response);

  if (!check.isValid) {
    let sanitized = response;
    for (const code of check.invalidCodes) {
      sanitized = sanitized.replace(
        new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        `[${code} - Unverified]`
      );
    }
    return sanitized;
  }

  return response;
}

export function getConfidenceLevel(
  validStandards: IndianStandard[],
  totalRetrieved: number
): { level: 'high' | 'medium' | 'low'; label: string; description: string } {
  if (validStandards.length === 0) {
    return {
      level: 'low',
      label: 'We need more information',
      description: 'Tell us the product material, intended use, or model number for better results.',
    };
  }

  if (validStandards.length >= 3 && totalRetrieved >= 5) {
    return {
      level: 'high',
      label: 'High confidence',
      description: 'Multiple verified sources match your product description.',
    };
  }

  return {
    level: 'medium',
    label: 'Moderate confidence',
    description: 'We found some relevant standards, but additional details may improve accuracy.',
  };
}

export function buildSafetyDisclaimer(): string {
  return 'This information is for guidance purposes. Please confirm all requirements with BIS or the applicable official notification. This system does not replace official BIS certification processes.';
}
