import React from "react";

const PhoneMockup = ({ children }: any) => (
  <div className="relative mx-auto h-[600px] w-[300px] rounded-[2.5rem] border-[14px] border-gray-800 bg-gray-800 dark:border-gray-800">
    <div className="absolute -left-[16px] top-[72px] h-[32px] w-[3px] rounded-l-lg bg-gray-800 dark:bg-gray-800"></div>
    <div className="absolute -left-[16px] top-[124px] h-[46px] w-[3px] rounded-l-lg bg-gray-800 dark:bg-gray-800"></div>
    <div className="absolute -left-[16px] top-[178px] h-[46px] w-[3px] rounded-l-lg bg-gray-800 dark:bg-gray-800"></div>
    <div className="absolute -right-[16px] top-[142px] h-[64px] w-[3px] rounded-r-lg bg-gray-800 dark:bg-gray-800"></div>
    <div className="no-scrollbar left-0  h-[572px] w-[272px] overflow-y-scroll rounded-[2rem] bg-white [clip-path:inset(0px_-1px_0px_0px_round_2rem)] dark:bg-gray-800">
      {children}
    </div>
    <div className="pointer-events-none absolute left-0 top-0 h-[72px] w-[272px]  rounded-t-[2rem] bg-gradient-to-t  from-transparent to-black opacity-50 [clip-path:inset(0px_0px_0px_0px_round_0rem)]"></div>
    <div className="pointer-events-none absolute bottom-0 left-0 h-[72px] w-[272px]  rounded-b-[2rem] bg-gradient-to-t  from-black to-transparent opacity-50 [clip-path:inset(0px_0px_0px_0px_round_0rem)]"></div>
  </div>
);

export default PhoneMockup;