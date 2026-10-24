import type { ReactNode } from "react";

interface ScaledStageProps {
    children: ReactNode;
}

/**
 * Holds the landing composition at its true Figma size (1470 × 900) and scales it down
 * proportionally below 1470px, in CSS only, so there is no flash or layout shift.
 *
 * The scale is 100cqw / 1470px, capped at 1. `tan(atan2(a, b))` turns that ratio of two
 * lengths into a plain number, which `scale` needs. Container width (cqw) excludes the
 * scrollbar, which viewport width would not. Above 1470px the stage stays at design size
 * and the negative-or-positive inline margins centre it.
 */
export const ScaledStage = ({ children }: ScaledStageProps) => {
    return (
        <div className="h-[calc(900px*var(--stage-scale))] [--stage-scale:min(1,tan(atan2(100cqw,1470px)))]">
            <div
                data-testid="landing-stage"
                className="relative mx-[calc((100cqw-1470px)/2)] h-[900px] w-[1470px] origin-top scale-(--stage-scale)"
            >
                {children}
            </div>
        </div>
    );
};
