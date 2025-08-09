import Image from "next/image";
import reactLogo from "../assets/react.svg";
import CounterButton from "../components/CounterButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="text-center max-w-4xl mx-auto w-full">
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_2em_#646cffaa] hover:brightness-110">
            <Image
              src="/vite.svg"
              alt="Vite logo"
              width={80}
              height={80}
              className="animate-[spin-slow_20s_linear_infinite] sm:w-[120px] sm:h-[120px]"
              priority
            />
          </div>
          <div className="transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_2em_#61dafbaa] hover:brightness-110">
            <Image
              src={reactLogo}
              alt="React logo"
              width={80}
              height={80}
              className="animate-[spin-slow_20s_linear_infinite] sm:w-[120px] sm:h-[120px]"
              priority
            />
          </div>
        </div>

        {/* Title Section */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          EcoLens
        </h1>
        
        <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Environmental insights powered by modern web technology. 
          Click on the Vite and React logos to learn more about the technologies powering this application.
        </p>

        {/* Interactive Section - Counter Component */}
        <div className="mb-6 sm:mb-8">
          <CounterButton />
        </div>

        {/* Footer Text */}
        <p className="text-xs sm:text-sm text-gray-400 px-4">
          Edit <code className="bg-gray-800 px-2 py-1 rounded text-blue-300 text-xs sm:text-sm">src/app/page.tsx</code> and save to test HMR
        </p>
      </div>
    </div>
  );
}
