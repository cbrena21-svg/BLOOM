import React, { useRef } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { FONT_REGULAR, FONT_BOLD } from '../../styles/typography';

const SIZE = 300;
const RADIUS = SIZE / 2;
const INDICATOR_SIZE = 50;
const INDICATOR_RADIUS = INDICATOR_SIZE / 2;
const CIRCLE_STROKE = 15;

// Radio de la línea principal y radio de los puntitos internos
const TRACK_RADIUS = RADIUS - CIRCLE_STROKE / 2;
const DOT_RADIUS = TRACK_RADIUS - 18; // Distancia de los puntitos hacia el centro

const GAP_ANGLE = 35;
const ARC_START_ANGLE = GAP_ANGLE / 2;
const ARC_SWEEP_ANGLE = 360 - GAP_ANGLE;
const ARC_END_ANGLE = ARC_START_ANGLE + ARC_SWEEP_ANGLE;

// Cálculos para la longitud del trazo principal
const CIRCUMFERENCE = 2 * Math.PI * TRACK_RADIUS;
const STROKE_DASH_MAIN = (ARC_SWEEP_ANGLE / 360) * CIRCUMFERENCE;
const STROKE_DASH_GAP = CIRCUMFERENCE - STROKE_DASH_MAIN;

export default function CycleCircle({
    color = '#FF5E7E',
    day,
    onDayChange,
    cycleLength = 28,
}) {
    const totalDays = Math.max(2, cycleLength);
    const wrapperRef = useRef(null);
    const circlePosition = useRef({ x: 0, y: 0 });

    const updateCircleCenter = () => {
        if (!wrapperRef.current) return;
        wrapperRef.current.measureInWindow((x, y, width, height) => {
            circlePosition.current = {
                x: x + width / 2,
                y: y + height / 2,
            };
        });
    };

    // Mapea el día a su posición angular visual
    const normalizeDayToAngle = (currentDay) => {
        const normalizedDay = Math.min(Math.max(currentDay, 1), totalDays);
        const progress = (normalizedDay - 1) / (totalDays - 1);
        return ARC_START_ANGLE + (progress * ARC_SWEEP_ANGLE);
    };

    // Genera los puntitos divisores para cada día del ciclo
    const renderDayDots = () => {
        const dots = [];
        for (let i = 1; i <= totalDays; i++) {
            const dotAngle = normalizeDayToAngle(i);
            const dotRadians = (dotAngle - 90) * (Math.PI / 180);

            // Coordenadas X e Y exactas para cada puntito
            const cx = RADIUS + DOT_RADIUS * Math.cos(dotRadians);
            const cy = RADIUS + DOT_RADIUS * Math.sin(dotRadians);

            dots.push(
                <Circle
                    key={`dot-${i}`}
                    cx={cx}
                    cy={cy}
                    r={2.5}
                    fill="rgba(255, 255, 255, 0.35)"
                />
            );
        }
        return dots;
    };

    // Captura el arrastre del usuario
    const getDayFromTouch = (moveX, moveY) => {
        const dx = moveX - circlePosition.current.x;
        const dy = moveY - circlePosition.current.y;

        const rawAngle = (Math.atan2(dy, dx) * 180 / Math.PI + 450) % 360;
        let clampedAngle = rawAngle;

        if (rawAngle < ARC_START_ANGLE || rawAngle > ARC_END_ANGLE) {
            const distanceToStart = Math.min(Math.abs(rawAngle - ARC_START_ANGLE), Math.abs(rawAngle + 360 - ARC_START_ANGLE));
            const distanceToEnd = Math.min(Math.abs(rawAngle - ARC_END_ANGLE), Math.abs(rawAngle - 360 - ARC_END_ANGLE));
            clampedAngle = distanceToStart < distanceToEnd ? ARC_START_ANGLE : ARC_END_ANGLE;
        }

        const progress = (clampedAngle - ARC_START_ANGLE) / ARC_SWEEP_ANGLE;
        const calculatedDay = Math.round(progress * (totalDays - 1)) + 1;

        return Math.min(Math.max(calculatedDay, 1), totalDays);
    };

    const angle = normalizeDayToAngle(day);
    const radians = (angle - 90) * (Math.PI / 180);

    // Coordenadas dinámicas para el indicador principal
    const x = RADIUS + TRACK_RADIUS * Math.cos(radians);
    const y = RADIUS + TRACK_RADIUS * Math.sin(radians);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gesture) => {
            updateCircleCenter();
            onDayChange(getDayFromTouch(gesture.moveX, gesture.moveY));
        },
        onPanResponderMove: (_, gesture) => {
            onDayChange(getDayFromTouch(gesture.moveX, gesture.moveY));
        },
    });

    // Rotación para mantener la apertura simétrica exactamente arriba
    const svgRotation = 270 + (GAP_ANGLE / 2);

    return (
        <View
            ref={wrapperRef}
            style={styles.wrapper}
            {...panResponder.panHandlers}
            onLayout={updateCircleCenter}
        >
            <Svg
                width={SIZE}
                height={SIZE}
                style={[styles.svgAbsolute, { transform: [{ rotate: `${svgRotation}deg` }] }]}
            >
                <Circle
                    cx={RADIUS}
                    cy={RADIUS}
                    r={TRACK_RADIUS}
                    stroke={color}
                    strokeWidth={CIRCLE_STROKE}
                    fill="none"
                    strokeDasharray={`${STROKE_DASH_MAIN} ${STROKE_DASH_GAP}`}
                    strokeLinecap="round"
                />
            </Svg>
            <Svg
                width={SIZE}
                height={SIZE}
                style={styles.svgAbsolute}
            >
                {renderDayDots()}
            </Svg>

            <View
                style={[
                    styles.indicator,
                    {
                        backgroundColor: '#2C2C45',
                        borderColor: '#808080',
                        left: x - INDICATOR_RADIUS,
                        top: y - INDICATOR_RADIUS,
                    },
                ]}
            >
                <Text style={styles.dayLabel}>día</Text>
                <Text style={styles.dayNumber}>{day}</Text>
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
    svgAbsolute: {
        position: 'absolute',
    },
    indicator: {
        position: 'absolute',
        width: INDICATOR_SIZE,
        height: INDICATOR_SIZE,
        borderRadius: INDICATOR_RADIUS,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
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