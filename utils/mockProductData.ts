export const mockProducts = [
  {
    id: '1742c912-a7a4-4d12-b560-97a5dd40e58e',
    product_name: 'Oldbrown',
    verification_id: 'VRF-8472-3910-5628',
    batch_number: '6001452631006',
    manufacture_date: '2025-10-15',
    alcohol_type: 'Gin',
    origin_country: 'GB',
    status: 'active',
    max_scans_allowed: 15,
    scan_count: 0,
    brand: {
      name: 'Sedgwicks',
      manufacturer: 'Sedgwicks Ltd',
      country_code: 'GB',
    },
  },
  {
    id: '2743c912-a7a4-4d12-b560-97a5dd40e58f',
    product_name: 'Tanqueray london dry gin',
    verification_id: 'VRF-8472-3910-41112',
    batch_number: '5000291020706',
    manufacture_date: '2025-09-20',
    alcohol_type: 'Gin',
    origin_country: 'GB',
    status: 'active',
    max_scans_allowed: 10,
    scan_count: 0,
    brand: {
      name: 'Tanqueray',
      manufacturer: 'Tanqueray Ltd',
      country_code: 'GB',
    },
  },
  {
    id: '3844c912-a7a4-4d12-b560-97a5dd40e590',
    product_name: 'Martini Tonic',
    verification_id: 'VRF-8472-3910-8888',
    batch_number: '5010677924009',
    manufacture_date: '2025-08-15',
    alcohol_type: 'Tonic',
    origin_country: 'IT',
    status: 'active',
    max_scans_allowed: 12,
    scan_count: 0,
    brand: {
      name: 'Martini',
      manufacturer: 'Martini & Rossi',
      country_code: 'IT',
    },
  },
  {
    id: '4945c912-a7a4-4d12-b560-97a5dd40e591',
    product_name: 'Gordons pink berry',
    verification_id: 'VRF-8472-3910-7524',
    batch_number: '5000289935937',
    manufacture_date: '2025-11-01',
    alcohol_type: 'Gin',
    origin_country: 'GB',
    status: 'active',
    max_scans_allowed: 20,
    scan_count: 0,
    brand: {
      name: 'Gordons',
      manufacturer: 'Gordons Ltd',
      country_code: 'GB',
    },
  },
  {
    id: '5046c912-a7a4-4d12-b560-97a5dd40e592',
    product_name: 'Sol',
    verification_id: 'VRF-8472-3910-6656',
    batch_number: '6009705712663',
    manufacture_date: '2025-07-10',
    alcohol_type: 'Beer',
    origin_country: 'MX',
    status: 'active',
    max_scans_allowed: 25,
    scan_count: 0,
    brand: {
      name: 'Sol',
      manufacturer: 'Sol Brewery',
      country_code: 'MX',
    },
  },
];

export const findProductByVerificationId = (verificationId: string) => {
  return mockProducts.find(
    (product) => product.verification_id === verificationId.trim()
  );
};

export const findProductByBatchNumber = (batchNumber: string) => {
  return mockProducts.find(
    (product) => product.batch_number === batchNumber.trim()
  );
};
