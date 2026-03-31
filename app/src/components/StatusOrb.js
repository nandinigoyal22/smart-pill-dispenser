import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../theme/AnalogPrecisionist';

export const StatusOrb = ({ isActive }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      // Breathing animation 1.0 to 1.05
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.08,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      scaleValue.stopAnimation();
      scaleValue.setValue(1);
    }
  }, [isActive]);

  return (
    <Animated.View 
      style={[
        styles.orb, 
        { 
          transform: [{ scale: scaleValue }],
          backgroundColor: isActive ? theme.colors.secondary : theme.colors.surfaceDim,
          shadowColor: isActive ? theme.colors.surfaceTint : 'transparent',
          shadowOpacity: isActive ? 0.4 : 0,
          shadowRadius: isActive ? 4 : 0,
          shadowOffset: { width: 0, height: 0 }
        }
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  orb: {
    width: 16,
    height: 16,
    borderRadius: 8,
  }
});
