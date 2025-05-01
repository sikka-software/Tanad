import { Check, Minus, MoveRight, PhoneCall } from "lucide-react";
import React from "react";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

// Define the structure for a pricing plan
interface PricingPlan {
  name: string;
  description: string;
  price: number | null; // Use null for Enterprise where price isn't shown directly
  priceSuffix: string;
  buttonText: string;
  buttonVariant: "outline" | "default";
  buttonIcon?: React.ElementType;
  features: {
    [featureName: string]: string | boolean;
  };
}

// Centralized data for pricing plans
const plans: PricingPlan[] = [
  {
    name: "Startup",
    description:
      "Our goal is to streamline SMB trade, making it easier and faster than ever for everyone and everywhere.",
    price: 40,
    priceSuffix: "/ month",
    buttonText: "Try it",
    buttonVariant: "outline",
    buttonIcon: MoveRight,
    features: {
      SSO: true,
      "AI Assistant": false,
      "Version Control": false,
      Members: "5 members",
      "Multiplayer Mode": false,
      Orchestration: false,
      Invoices: "50 invoice/month",
      Employees: "10 employees",
    },
  },
  {
    name: "Growth",
    description:
      "Our goal is to streamline SMB trade, making it easier and faster than ever for everyone and everywhere.",
    price: 40, // TODO: Update price if needed
    priceSuffix: "/ month",
    buttonText: "Try it",
    buttonVariant: "default",
    buttonIcon: MoveRight,
    features: {
      SSO: true,
      "AI Assistant": true,
      "Version Control": true,
      Members: "25 members",
      "Multiplayer Mode": true,
      Orchestration: true,
      Invoices: "500 invoice/month",
      Employees: "100 employees",
    },
  },
  {
    name: "Enterprise",
    description:
      "Our goal is to streamline SMB trade, making it easier and faster than ever for everyone and everywhere.",
    price: null, // No direct price shown for Enterprise
    priceSuffix: "", // No suffix needed without a price
    buttonText: "Contact us",
    buttonVariant: "outline",
    buttonIcon: PhoneCall,
    features: {
      SSO: true,
      "AI Assistant": true,
      "Version Control": true,
      Members: "100+ members",
      "Multiplayer Mode": true,
      Orchestration: true,
      Invoices: "Unlimited",
      Employees: "Unlimited",
    },
  },
];

// Define the order of features to be displayed
const featureOrder = [
  "SSO",
  "AI Assistant",
  "Version Control",
  "Members",
  "Multiplayer Mode",
  "Orchestration",
  "Invoices",
  "Employees",
];

function Pricing() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Badge>Pricing</Badge>
          <div className="flex flex-col gap-2">
            <h2 className="font-regular max-w-xl text-center text-3xl tracking-tighter md:text-5xl">
              Prices that make sense!
            </h2>
            <p className="text-muted-foreground max-w-xl text-center text-lg leading-relaxed tracking-tight">
              Managing a small business today is already tough.
            </p>
          </div>
          <div className="bg--200 grid w-full grid-cols-3 divide-x pt-20 text-start lg:grid-cols-4">
            <div className="col-span-3 lg:col-span-1"></div>
            {/* Render Plan Headers */}
            {plans.map((plan) => (
              <div key={plan.name} className="flex flex-col gap-2 px-3 py-1 md:px-6 md:py-4">
                <p className="text-2xl">{plan.name}</p>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
                <p className="mt-8 flex flex-col gap-2 text-xl lg:flex-row lg:items-center">
                  {plan.price !== null ? (
                    <>
                      <span className="text-4xl">${plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.priceSuffix}</span>
                    </>
                  ) : (
                    // Handle Enterprise case where price is not displayed directly
                    <span className="text-muted-foreground text-lg">—</span>
                  )}
                </p>
                <Button variant={plan.buttonVariant} className="mt-8 gap-4">
                  {plan.buttonText} {plan.buttonIcon && <plan.buttonIcon className="h-4 w-4" />}
                </Button>
              </div>
            ))}

            {/* Render Features Header */}
            <div className="bg--400 col-span-3 border-s px-3 py-4 lg:col-span-1 lg:px-6">
              <b>Features</b>
            </div>
            {/* Placeholder divs for alignment */}
            {plans.map((_, index) => (
              <div key={`placeholder-${index}`} className={index === 0 ? "bg--800" : ""}></div>
            ))}

            {/* Render Feature Rows */}
            {featureOrder.map((featureName) => (
              <React.Fragment key={featureName}>
                <div className="col-span-3 border-s px-3 py-4 lg:col-span-1 lg:px-6">
                  {featureName}
                </div>
                {plans.map((plan) => (
                  <div
                    key={`${plan.name}-${featureName}`}
                    className="flex justify-center px-3 py-1 md:px-6 md:py-4"
                  >
                    {typeof plan.features[featureName] === "boolean" ? (
                      plan.features[featureName] ? (
                        <Check className="text-primary h-4 w-4" />
                      ) : (
                        <Minus className="text-muted-foreground h-4 w-4" />
                      )
                    ) : (
                      <p className="text-muted-foreground text-sm">{plan.features[featureName]}</p>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Pricing };
