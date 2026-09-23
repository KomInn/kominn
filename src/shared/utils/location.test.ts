import { formatLatLng, parseLatLng } from './location';

describe('parseLatLng', () => {
  it('tolker gyldige verdier', () => {
    expect(parseLatLng('59.8331,10.4392')).toEqual({ lat: 59.8331, lng: 10.4392 });
    expect(parseLatLng(' 59.8 , 10.4 ')).toEqual({ lat: 59.8, lng: 10.4 });
  });
  it('avviser ugyldige verdier', () => {
    expect(parseLatLng('')).toBeUndefined();
    expect(parseLatLng('abc')).toBeUndefined();
    expect(parseLatLng('95,10')).toBeUndefined();
    expect(parseLatLng('59.8')).toBeUndefined();
  });
  it('formaterer med fem desimaler', () => {
    expect(formatLatLng({ lat: 59.833123456, lng: 10.4 })).toBe('59.83312,10.40000');
  });
});
