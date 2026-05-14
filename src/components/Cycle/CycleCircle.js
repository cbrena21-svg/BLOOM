import React from 'react';
import {View, StyleSheet, PanResponder} from 'react-native';

const SIZE = 280;
const RADIUS = SIZE / 2;



export default function CycleCircle({
    color,
    day,
    onDayChange,
}) {
    const totalDays = 28;

  const angle = (day / totalDays) * 360;

  const radians = (angle - 90) * (Math.PI / 180);

const x = RADIUS + RADIUS * Math.cos(radians);
  const y = RADIUS + RADIUS * Math.sin(radians);

    const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderMove: (_, gesture) => {
        const centerX = SIZE / 2;
        const centerY = SIZE / 2;

        const dx = gesture.moveX - centerX;
        const dy = gesture.moveY - centerY;

        let theta = Math.atan2(dy, dx);

        theta += Math.PI / 2;

      if (theta < 0) theta += 2 * Math.PI;

        const calculatedDay = Math.round(
        (theta / (2 * Math.PI)) * totalDays
        );

        onDayChange(Math.max(1, Math.min(28, calculatedDay)));
    },
    });

    return (
    <View style={styles.wrapper}>
        <View
        style={[
            styles.circle,
            {
            borderColor: color,
            },
        ]}
        />

        <View
        {...panResponder.panHandlers}
        style={[
            styles.indicator,
            {
            backgroundColor: '#2C2C45',
            borderColor: color,
            left: x - 22,
            top: y - 22,
            },
        ]}
        />
    </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    },

    circle: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 5,
    },

    indicator: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    },
});