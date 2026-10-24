import { EarlyAccessTrigger } from "@/components/early-access/early-access-provider";

export const HeroContent = () => {
    return (
        <section className="flex h-[262px] flex-col justify-center px-24 py-2">
            <div className="flex items-center justify-between">
                <h1 className="flex w-[607px] flex-col gap-1 text-display-md font-medium">
                    <span className="text-primary">Your customers already chat.</span>
                    <span className="text-brand-primary">Now they can order there too.</span>
                </h1>
                <div className="flex w-[481px] flex-col items-start gap-4">
                    <p className="text-sm text-primary">
                        Sign up, add your products, and your own ordering bot is ready to share with customers. Built for grocery stores, supermarkets
                        and restaurants.
                    </p>
                    {/* Figma draws the primary button flat: medium weight, no shadow, ring or inner border. */}
                    <EarlyAccessTrigger color="primary" size="sm" className="font-medium shadow-none ring-0 before:hidden">
                        Get early access
                    </EarlyAccessTrigger>
                </div>
            </div>
        </section>
    );
};
