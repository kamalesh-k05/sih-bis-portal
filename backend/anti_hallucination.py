from typing import List, Dict, Set, Tuple
import re
from standards_data import IS_CODE_WHITELIST

IS_PATTERN = re.compile(r'IS\s*\d+(\.\d+)?', re.IGNORECASE)


def extract_is_codes(text: str) -> List[str]:
    codes = [m.group(0).strip().upper() for m in IS_PATTERN.finditer(text)]
    return list(dict.fromkeys(codes))


def validate_response(response_text: str) -> Dict:
    codes_found = extract_is_codes(response_text)
    valid = [c for c in codes_found if c in IS_CODE_WHITELIST]
    invalid = [c for c in codes_found if c not in IS_CODE_WHITELIST]
    warnings = [f'WARNING: {c} is not in our verified standards database.' for c in invalid]

    return {
        'is_valid': len(invalid) == 0,
        'codes_found': codes_found,
        'valid_codes': valid,
        'invalid_codes': invalid,
        'warnings': warnings,
    }


def is_verified_is_code(code: str) -> bool:
    return code.strip().upper() in IS_CODE_WHITELIST
