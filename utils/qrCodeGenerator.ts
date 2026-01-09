export function generateVerificationId(): string {
  const segment1 = Math.floor(1000 + Math.random() * 9000);
  const segment2 = Math.floor(1000 + Math.random() * 9000);
  const segment3 = Math.floor(1000 + Math.random() * 9000);
  return `VRF-${segment1}-${segment2}-${segment3}`;
}

export function generateSecureVerificationId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const segments = [];

  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  return `VRF-${segments.join('-')}`;
}

export function validateVerificationId(id: string): boolean {
  const pattern = /^VRF-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(id);
}
