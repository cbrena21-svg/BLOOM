import React, {useRef} from 'react';
import {View, Text, StyleSheet, PanResponder} from 'react-native';
import { FONT_REGULAR, FONT_BOLD } from '../../styles/typography';

const SIZE = 300;
const RADIUS = SIZE / 2;
const INDICATOR_SIZE = 52;
const INDICATOR_RADIUS = INDICATOR_SIZE / 2;
const CIRCLE_STROKE = 12;
const TRACK_RADIUS = RADIUS - CIRCLE_STROKE / 2;

export default function CycleCircle({
    color,
    day,
    onDayChange,
}) {
    const totalDays = 28;
    const wrapperRef = useRef(null);

    const circlePosition = useRef({
    x: 0,
    y: 0,
    });

    const updateCircleCenter = () => {
    if (!wrapperRef.current) {
        return;
    }

    wrapperRef.current.measureInWindow((x, y, width, height) => {
        circlePosition.current = {
        x: x + width / 2,
        y: y + height / 2,
        };
    });
    };

  const angle = (day / totalDays) * 360;

  const radians = (angle - 90) * (Math.PI / 180);

    const x =
    RADIUS + TRACK_RADIUS * Math.cos(radians);

    const y =
    RADIUS + TRACK_RADIUS * Math.sin(radians);

    const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (_, gesture) => {
        updateCircleCenter();

        const dx = gesture.moveX - circlePosition.current.x;
        const dy = gesture.moveY - circlePosition.current.y;

        let theta = Math.atan2(dy, dx);
        theta += Math.PI / 2;

        if (theta < 0) {
            theta += 2 * Math.PI;
        }

        let calculatedDay = Math.round((theta / (2 * Math.PI)) * totalDays);

        if (calculatedDay <= 0) {
            calculatedDay = 1;
        }

        if (calculatedDay > 28) {
            calculatedDay = 28;
        }

        onDayChange(calculatedDay);
    },

    onPanResponderMove: (_, gesture) => {
        const dx = gesture.moveX - circlePosition.current.x;
        const dy = gesture.moveY - circlePosition.current.y;

        let theta = Math.atan2(dy, dx);

        theta += Math.PI / 2;

        if (theta < 0) {
        theta += 2 * Math.PI;
        }

        let calculatedDay = Math.round(
        (theta / (2 * Math.PI)) * totalDays
        );

        if (calculatedDay <= 0) {
        calculatedDay = 1;
        }

        if (calculatedDay > 28) {
        calculatedDay = 28;
        }

        onDayChange(calculatedDay);
    },
    });

    return (
    <View
        ref={wrapperRef}
        style={styles.wrapper}
        {...panResponder.panHandlers}
        onLayout={updateCircleCenter}>
      {/* CÍRCULO GRANDE */}
        <View
        style={[
            styles.circle,
            {
            borderColor: color,
            },
        ]}
        />

      {/* INDICADOR */}
        <View
        style={[
            styles.indicator,
            {
            backgroundColor: '#2C2C45',
            borderColor: '#808080',
            left: x - INDICATOR_RADIUS,
            top: y - INDICATOR_RADIUS,
            },
        ]}>
        <Text style={styles.dayLabel}>
            día
        </Text>

        <Text style={styles.dayNumber}>
            {day}
        </Text>
        </View>
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
    borderWidth: CIRCLE_STROKE,
    },

    indicator: {
    position: 'absolute',
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_RADIUS,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    },

    dayLabel: {
    fontSize: 8,
    color: '#C8B8D8',
    fontWeight: '600',
    fontFamily: FONT_REGULAR,
    marginBottom: -2,
    },

    dayNumber: {
    fontSize: 16,
    color: '#C8B8D8',
    fontWeight: '800',
    fontFamily: FONT_BOLD,
    lineHeight: 18,
    },
});