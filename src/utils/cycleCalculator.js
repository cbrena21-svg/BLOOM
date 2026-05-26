export const getCurrentCycleDay = (
    lastPeriodDate,
    cycleLength = 28
) => {
    const today = new Date();

    const diffTime = today.getTime() - lastPeriodDate.getTime();

    const diffDays = Math.floor(
    diffTime / (1000 * 60 * 60 * 24)
    );

    const currentDay = diffDays + 1;
    if (currentDay < 1) return 1;

    return Math.min(currentDay, cycleLength);
};