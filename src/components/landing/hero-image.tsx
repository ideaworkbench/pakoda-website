"use client";

// A client component only because a custom `loader` is a function, which cannot cross from a
// server component; the image is still rendered into the static HTML.
import Image, { type ImageLoader } from "next/image";

const designWidth = 1470;
const designHeight = 535;

// The files are Figma's exact crop at 1× and 2×, encoded as AVIF (quality 70), which scores
// 0% against the original in the Figma comparison at about a tenth of the PNG size. They are
// served untouched; the optimizer would resize and re-encode them again. For a fixed-size
// image Next.js builds a 1x/2x srcset and asks for the next configured width at or above
// each density, so anything from twice the design width up is the 2× file.
const heroPhotoLoader: ImageLoader = ({ width }) =>
    width >= designWidth * 2 ? `/brand/hero-photo@2x.avif?w=${width}` : `/brand/hero-photo@1x.avif?w=${width}`;

export const HeroImage = () => {
    return (
        <Image
            data-testid="hero-image"
            src="/brand/hero-photo@1x.avif"
            loader={heroPhotoLoader}
            alt=""
            width={designWidth}
            height={designHeight}
            priority
            className="block h-[535px] w-[1470px]"
        />
    );
};
