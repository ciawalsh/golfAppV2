import { useState, useCallback, useEffect } from 'react';
import { Image, ImageProps, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface FallbackImageProps extends Omit<ImageProps, 'source'> {
  uri: string | undefined;
  fallbackIcon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  fallbackIconSize?: number;
}

export function FallbackImage({
  uri,
  fallbackIcon = 'image-off-outline',
  fallbackIconSize = 24,
  style,
  ...props
}: FallbackImageProps) {
  const [hasError, setHasError] = useState(false);

  const onError = useCallback(() => {
    setHasError(true);
  }, []);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  if (!uri || hasError) {
    return (
      <View style={[styles.placeholder, style]}>
        <MaterialCommunityIcons
          name={fallbackIcon}
          size={fallbackIconSize}
          color={colors.grey400}
        />
      </View>
    );
  }

  return <Image source={{ uri }} style={style} onError={onError} {...props} />;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
