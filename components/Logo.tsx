import { Image, StyleSheet } from 'react-native';

export function Logo({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizes = {
    small: { width: 40, height: 111 },
    medium: { width: 80, height: 222 },
    large: { width: 120, height: 333 },
  };

  const dimensions = sizes[size];

  return (
    <Image
      source={require('@/assets/images/qualibev-logo.png')}
      style={[styles.logo, dimensions]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});
