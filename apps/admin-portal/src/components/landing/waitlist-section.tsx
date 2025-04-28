import { Button } from "../ui/button";
import { Input } from "../ui/input";

const WaitlistSection = () => {
  return (
    <div className="relative z-10 flex flex-1 items-center justify-center bg-red-300">
      <div className="mx-auto w-full max-w-xl space-y-12 p-8">
        <div className="space-y-6 text-center">
          <h2 className="bg-gradient-to-br from-gray-200 to-gray-600 bg-clip-text text-center text-4xl font-extrabold text-transparent sm:text-5xl">
            Join Our Product Launch Waitlist
          </h2>
          <p className="mx-auto max-w-lg text-xl text-gray-400">
            Be part of something truly extraordinary. Join thousands of others already gaining early
            access to our revolutionary new product.
          </p>
        </div>

        <div className="mx-auto flex max-w-md gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            className="h-12 border-gray-800 bg-gray-950/50"
          />
          <Button className="h-12 bg-black px-6 text-white hover:bg-black/90" variant="ghost">
            Get Notified
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistSection;
