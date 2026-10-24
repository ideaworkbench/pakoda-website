import Image from "next/image";
import { Button } from "@/components/base/buttons/button";

// Logo parts sit at Figma's exact offsets inside the 139 × 32 "Logo wrap"; the mark overhangs it by 2px.
const SiteLogo = () => (
    <div className="relative h-[32px] w-[139px] shrink-0">
        <span className="absolute top-[-2px] left-[-0.236px] h-[36px] w-[32.475px]">
            <Image src="/brand/site-logomark.svg" alt="" fill unoptimized priority />
        </span>
        <span className="absolute top-[7.917px] left-[42.006px] h-[15px] w-[74.827px]">
            <Image src="/brand/site-logotype.svg" alt="Pakoda" fill unoptimized priority />
        </span>
    </div>
);

export const SiteHeader = () => {
    return (
        <header className="flex h-[103px] items-center justify-between p-8">
            <SiteLogo />
            {/* Figma uses medium weight; Untitled UI buttons default to semibold. */}
            <Button color="secondary" size="sm" className="font-medium">
                Join the list
            </Button>
        </header>
    );
};
