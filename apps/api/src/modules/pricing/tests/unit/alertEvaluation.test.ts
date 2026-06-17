import { isAlertTriggered } from '../../domain/alertEvaluation.js';

describe('isAlertTriggered', () => {
  it('BELOW triggers when price <= target', () => {
    expect(isAlertTriggered('BELOW', 500, 480)).toBe(true);
    expect(isAlertTriggered('BELOW', 500, 500)).toBe(true);
    expect(isAlertTriggered('BELOW', 500, 520)).toBe(false);
  });

  it('ABOVE triggers when price >= target', () => {
    expect(isAlertTriggered('ABOVE', 500, 520)).toBe(true);
    expect(isAlertTriggered('ABOVE', 500, 500)).toBe(true);
    expect(isAlertTriggered('ABOVE', 500, 480)).toBe(false);
  });
});
