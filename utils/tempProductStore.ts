let currentProduct: any = null;

export const setCurrentProduct = (product: any) => {
  currentProduct = product;
};

export const getCurrentProduct = () => {
  return currentProduct;
};

export const clearCurrentProduct = () => {
  currentProduct = null;
};
