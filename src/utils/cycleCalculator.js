export const getCurrentCycleDay = (
    lastPeriodDate,
    cycleLength = 28
) => {
    const today = new Date();

    const diffTime = today.getTime() - lastPeriodDate.getTime();

    const diffDays = Math.floor(
    diffTime / (1000 * 60 * 60 * 24)
    );

    return (diffDays % cycleLength) + 1;
};